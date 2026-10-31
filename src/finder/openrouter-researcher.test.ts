import { describe, expect, it } from "vitest";
import type { FinderAnswers } from "./answers";
import {
  createOpenRouterResearcher,
  FinderResearchError,
  type ResearchCandidate,
} from "./openrouter-researcher";
import { APPROVED_RESEARCH_DOMAINS } from "./research-domains";

const answers: FinderAnswers = {
  smoke: "strong",
  intensity: "bold",
  sweetness: "dry-spicy",
  fruit: "dark",
  priceTier: undefined,
};

const candidates: ResearchCandidate[] = [
  {
    id: "glen",
    name: "GlenAllachie 12",
    distillery: "GlenAllachie",
    country: "Шотландия",
    region: "Speyside",
    origin: "Scotch",
    ageYears: 12,
    abv: 46,
    priceTier: "CORE",
  },
  {
    id: "ardbeg",
    name: "Ardbeg 10",
    distillery: "Ardbeg",
    country: "Шотландия",
    region: "Islay",
    origin: "Scotch",
    ageYears: 10,
    abv: 46,
    priceTier: "CORE",
  },
];

type Captured = { url: string; init: RequestInit };

function completion(content: unknown): Response {
  return Response.json({
    id: "gen-1",
    choices: [
      {
        message: {
          role: "assistant",
          content:
            typeof content === "string" ? content : JSON.stringify(content),
        },
      },
    ],
  });
}

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Captured[] = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ? init : {} });
    return respond();
  };
  return { calls, fetch: fetchImpl as typeof fetch };
}

function researcherWith(respond: () => Response | Promise<Response>) {
  const fake = fakeFetch(respond);
  const researcher = createOpenRouterResearcher({
    apiKey: "test-key",
    model: "openai/gpt-5.6-terra",
    fetch: fake.fetch,
  });
  return { researcher, calls: fake.calls };
}

function bodyOf(call: Captured): Record<string, unknown> {
  return JSON.parse(String(call.init.body));
}

async function researchError(
  respond: () => Response | Promise<Response>,
): Promise<FinderResearchError> {
  const { researcher } = researcherWith(respond);
  try {
    await researcher.research({ answers, candidates });
  } catch (error) {
    if (error instanceof FinderResearchError) {
      return error;
    }
    throw error;
  }
  throw new Error("Expected research to fail");
}

describe("OpenRouter Finder research request", () => {
  it("posts one uncached chat completion with the configured model", async () => {
    const { researcher, calls } = researcherWith(() =>
      completion({ recommendations: [] }),
    );

    await researcher.research({ answers, candidates });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.cache).toBe("no-store");
    const headers = new Headers(calls[0].init.headers);
    expect(headers.get("authorization")).toBe("Bearer test-key");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-openrouter-cache")).toBe("false");
    expect(bodyOf(calls[0]).model).toBe("openai/gpt-5.6-terra");
  });

  it("runs fresh research limited to approved domains on every run", async () => {
    const { researcher, calls } = researcherWith(() =>
      completion({ recommendations: [] }),
    );

    await researcher.research({ answers, candidates });
    await researcher.research({ answers, candidates });

    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(bodyOf(call).plugins).toEqual([
        expect.objectContaining({
          id: "web",
          include_domains: [...APPROVED_RESEARCH_DOMAINS],
        }),
      ]);
    }
    expect(APPROVED_RESEARCH_DOMAINS.length).toBeGreaterThan(0);
  });

  it("denies provider data collection and requires zero data retention", async () => {
    const { researcher, calls } = researcherWith(() =>
      completion({ recommendations: [] }),
    );

    await researcher.research({ answers, candidates });

    expect(bodyOf(calls[0]).provider).toEqual({
      data_collection: "deny",
      zdr: true,
    });
  });

  it("sends no Customer identity, only answers and Catalogue facts", async () => {
    const { researcher, calls } = researcherWith(() =>
      completion({ recommendations: [] }),
    );

    await researcher.research({ answers, candidates });

    const body = bodyOf(calls[0]);
    expect(Object.keys(body).sort()).toEqual(
      ["messages", "model", "plugins", "provider", "response_format"].sort(),
    );
    expect(body).not.toHaveProperty("user");
    expect(body).not.toHaveProperty("session_id");
    const headers = new Headers(calls[0].init.headers);
    expect([...headers.keys()].sort()).toEqual(
      ["authorization", "content-type", "x-openrouter-cache"].sort(),
    );

    const prompt = JSON.stringify(body.messages);
    expect(prompt).toContain("heavy smoke and peat");
    expect(prompt).toContain("dark fruit");
    expect(prompt).toContain("glen");
    expect(prompt).toContain("Ardbeg 10");
    expect(prompt).toContain("Islay");
  });

  it("asks for a strict JSON ranking of Catalogue IDs with short reasons", async () => {
    const { researcher, calls } = researcherWith(() =>
      completion({ recommendations: [] }),
    );

    await researcher.research({
      answers: { ...answers, priceTier: "PREMIUM" },
      candidates,
    });

    const body = bodyOf(calls[0]);
    expect(body.response_format).toMatchObject({
      type: "json_schema",
      json_schema: { strict: true },
    });
    const prompt = JSON.stringify(body.messages);
    expect(prompt).toContain("PREMIUM");
  });
});

describe("OpenRouter Finder research response", () => {
  it("returns the AI ranking in its own order", async () => {
    const { researcher } = researcherWith(() =>
      completion({
        recommendations: [
          { whiskyId: "ardbeg", reason: "Силен торф и морска сол." },
          { whiskyId: "glen", reason: "Шери и тъмни плодове." },
        ],
      }),
    );

    await expect(researcher.research({ answers, candidates })).resolves.toEqual(
      [
        { whiskyId: "ardbeg", reason: "Силен торф и морска сол." },
        { whiskyId: "glen", reason: "Шери и тъмни плодове." },
      ],
    );
  });

  it("fails as unavailable when the network request throws", async () => {
    const error = await researchError(() => {
      throw new TypeError("fetch failed");
    });
    expect(error.kind).toBe("unavailable");
  });

  it("fails as unavailable on a non-2xx status", async () => {
    const error = await researchError(
      () => new Response("rate limited", { status: 429 }),
    );
    expect(error.kind).toBe("unavailable");
  });

  it("fails as unavailable when OpenRouter reports an error body", async () => {
    const error = await researchError(() =>
      Response.json({ error: { code: 502, message: "Provider error" } }),
    );
    expect(error.kind).toBe("unavailable");
  });

  it("fails as an invalid response when the body is not JSON", async () => {
    const error = await researchError(() => new Response("<html>oops</html>"));
    expect(error.kind).toBe("invalid-response");
  });

  it("fails as an invalid response when the content is not JSON", async () => {
    const error = await researchError(() =>
      completion("Here are my picks: Ardbeg 10"),
    );
    expect(error.kind).toBe("invalid-response");
  });

  it("fails as an invalid response when the content breaks the schema", async () => {
    for (const content of [
      { picks: [] },
      { recommendations: "ardbeg" },
      { recommendations: [{ whiskyId: 7, reason: "x" }] },
      { recommendations: [{ whiskyId: "ardbeg" }] },
    ]) {
      const error = await researchError(() => completion(content));
      expect(error.kind).toBe("invalid-response");
    }
  });

  it("fails as not configured without an API key and makes no request", async () => {
    const fake = fakeFetch(() => completion({ recommendations: [] }));
    const researcher = createOpenRouterResearcher({
      apiKey: undefined,
      model: "openai/gpt-5.6-terra",
      fetch: fake.fetch,
    });

    await expect(
      researcher.research({ answers, candidates }),
    ).rejects.toMatchObject({ kind: "not-configured" });
    expect(fake.calls).toHaveLength(0);
  });
});
