/**
 * Canned OpenRouter replies for integration tests (`FINDER_FIXTURE` /
 * `x-finder-fixture`). They stand in for the network only, so request
 * building, response parsing, and Catalogue enforcement all still run.
 * Whisky IDs match the `mixed` Shop fixture.
 */
export const FINDER_FIXTURE_NAMES = [
  "ranked",
  "empty",
  "invalid-ids",
  "http-error",
  "malformed",
] as const;
export type FinderFixtureName = (typeof FINDER_FIXTURE_NAMES)[number];

export function isFinderFixtureName(value: string): value is FinderFixtureName {
  return (FINDER_FIXTURE_NAMES as readonly string[]).includes(value);
}

const RANKED = [
  // Ask us outranks Buy: AI relevance is the source of truth.
  {
    whiskyId: "ask",
    reason: "Плътно шери с тъмни плодове и мек дъбов завършек.",
  },
  { whiskyId: "ghost-whisky", reason: "Не е в каталога." },
  {
    whiskyId: "buy",
    reason: "Стафиди и смокини без опушеност https://www.whiskybase.com/1",
  },
  { whiskyId: "draft", reason: "Чернова, която не бива да се показва." },
  { whiskyId: "page-03", reason: "Мед и сушени плодове." },
  { whiskyId: "partial", reason: "Сладка ванилия и синя слива." },
  { whiskyId: "page-01", reason: "Лек, плодов и достъпен." },
  { whiskyId: "page-02", reason: "Четвърти в своя клас, затова е отрязан." },
];

const INVALID_IDS = [
  { whiskyId: "ghost-whisky", reason: "Не е в каталога." },
  { whiskyId: "draft", reason: "Чернова." },
];

function completion(content: string): Response {
  return Response.json({
    id: "fixture-generation",
    choices: [{ message: { role: "assistant", content } }],
  });
}

export function fixtureOpenRouterFetch(name: FinderFixtureName): typeof fetch {
  return async () => {
    if (name === "http-error") {
      return new Response("Fixture upstream failure", { status: 503 });
    }
    if (name === "malformed") {
      return completion("Препоръчвам Fixture Buy Bottle.");
    }
    if (name === "empty") {
      return completion(JSON.stringify({ recommendations: [] }));
    }
    if (name === "invalid-ids") {
      return completion(JSON.stringify({ recommendations: INVALID_IDS }));
    }
    return completion(JSON.stringify({ recommendations: RANKED }));
  };
}
