import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "@/shop/in-memory-home-store";
import { createShop } from "@/shop/shop";
import type { FinderAnswers } from "./answers";
import { createFinder } from "./finder";
import {
  FinderResearchError,
  type FinderResearcher,
  type RankedRecommendation,
  type ResearchCandidate,
} from "./openrouter-researcher";

const answers: FinderAnswers = {
  smoke: "none",
  intensity: "balanced",
  sweetness: "sweet",
  fruit: "dark",
  priceTier: undefined,
};

function shopWith() {
  const whisky = (id: string, name: string) => ({
    id,
    name,
    photoUrl: "/bottles/glenallachie-12.svg",
    origin: "Scotch" as const,
    distillery: `${name} Distillery`,
    country: "Шотландия",
  });
  return createShop({
    store: createInMemoryHomeStore({
      whiskies: [
        whisky("entry-a", "Entry A"),
        whisky("entry-b", "Entry B"),
        whisky("entry-c", "Entry C"),
        whisky("entry-d", "Entry D"),
        whisky("core-buy", "Core Buy"),
        whisky("core-ask", "Core Ask"),
        whisky("premium", "Premium"),
        { ...whisky("draft", "Draft"), published: false },
      ],
      primarySkus: [
        { whiskyId: "entry-a", priceEur: 30, quantity: 1 },
        { whiskyId: "entry-b", priceEur: 40, quantity: 1 },
        { whiskyId: "entry-c", priceEur: 45, quantity: 0 },
        { whiskyId: "entry-d", priceEur: 50, quantity: 1 },
        { whiskyId: "core-buy", priceEur: 60, quantity: 2 },
        { whiskyId: "core-ask", priceEur: 85, quantity: 0 },
        { whiskyId: "premium", priceEur: 200, quantity: 1 },
        { whiskyId: "draft", priceEur: 60, quantity: 1 },
      ],
    }),
  });
}

function scriptedResearcher(ranking: RankedRecommendation[]) {
  const inputs: { answers: FinderAnswers; candidates: ResearchCandidate[] }[] =
    [];
  const researcher: FinderResearcher = {
    async research(input) {
      inputs.push(input);
      return ranking;
    },
  };
  return { researcher, inputs };
}

function rec(whiskyId: string, reason = `Причина за ${whiskyId}.`) {
  return { whiskyId, reason };
}

function ids(
  outcome: Awaited<ReturnType<ReturnType<typeof createFinder>["run"]>>,
) {
  if (outcome.status !== "results") {
    throw new Error(`Expected results, got ${outcome.status}`);
  }
  return outcome.groups.map((group) => ({
    tier: group.tier,
    ids: group.whiskies.map((item) => item.whisky.id),
  }));
}

describe("Finder run", () => {
  it("researches every published Catalogue Whisky without Availability or price", async () => {
    const { researcher, inputs } = scriptedResearcher([]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await finder.run(answers);

    expect(inputs).toHaveLength(1);
    expect(inputs[0].answers).toEqual(answers);
    expect(
      inputs[0].candidates.map((candidate) => candidate.id).sort(),
    ).toEqual([
      "core-ask",
      "core-buy",
      "entry-a",
      "entry-b",
      "entry-c",
      "entry-d",
      "premium",
    ]);
    expect(Object.keys(inputs[0].candidates[0]).sort()).toEqual(
      [
        "abv",
        "ageYears",
        "country",
        "distillery",
        "id",
        "name",
        "origin",
        "priceTier",
        "region",
      ].sort(),
    );
  });

  it("only offers the chosen Price tier to the research", async () => {
    const { researcher, inputs } = scriptedResearcher([]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await finder.run({ ...answers, priceTier: "CORE" });

    expect(
      inputs[0].candidates.map((candidate) => candidate.id).sort(),
    ).toEqual(["core-ask", "core-buy"]);
  });

  it("calls the research afresh on every run", async () => {
    const { researcher, inputs } = scriptedResearcher([rec("core-buy")]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await finder.run(answers);
    await finder.run(answers);

    expect(inputs).toHaveLength(2);
  });

  it("keeps the AI relevance order, letting Ask us rank above Buy", async () => {
    const { researcher } = scriptedResearcher([
      rec("core-ask"),
      rec("core-buy"),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    const outcome = await finder.run(answers);

    expect(ids(outcome)).toEqual([
      { tier: "CORE", ids: ["core-ask", "core-buy"] },
    ]);
    if (outcome.status === "results") {
      expect(
        outcome.groups[0].whiskies.map((item) => item.whisky.action),
      ).toEqual(["ask-us", "buy"]);
    }
  });

  it("drops IDs outside the published Catalogue", async () => {
    const { researcher } = scriptedResearcher([
      rec("ghost"),
      rec("draft"),
      rec("entry-a"),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    expect(ids(await finder.run(answers))).toEqual([
      { tier: "ENTRY", ids: ["entry-a"] },
    ]);
  });

  it("drops Whiskies outside the chosen Price tier", async () => {
    const { researcher } = scriptedResearcher([
      rec("entry-a"),
      rec("core-buy"),
      rec("premium"),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    expect(ids(await finder.run({ ...answers, priceTier: "CORE" }))).toEqual([
      { tier: "CORE", ids: ["core-buy"] },
    ]);
  });

  it("keeps at most three per Price tier and orders tiers by best match", async () => {
    const { researcher } = scriptedResearcher([
      rec("premium"),
      rec("entry-d"),
      rec("core-buy"),
      rec("entry-c"),
      rec("entry-a"),
      rec("entry-b"),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    expect(ids(await finder.run(answers))).toEqual([
      { tier: "PREMIUM", ids: ["premium"] },
      { tier: "ENTRY", ids: ["entry-d", "entry-c", "entry-a"] },
      { tier: "CORE", ids: ["core-buy"] },
    ]);
  });

  it("ignores repeated IDs", async () => {
    const { researcher } = scriptedResearcher([
      rec("entry-a"),
      rec("entry-a"),
      rec("entry-b"),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    expect(ids(await finder.run(answers))).toEqual([
      { tier: "ENTRY", ids: ["entry-a", "entry-b"] },
    ]);
  });

  it("keeps reasons short and free of links", async () => {
    const long = `${"Плътно и сладко с нотки на шери ".repeat(10)}край.`;
    const { researcher } = scriptedResearcher([
      rec("entry-a", "  Сладко шери, виж https://whiskybase.com/x  "),
      rec("entry-b", long),
      rec("entry-c", "   "),
    ]);
    const finder = createFinder({ shop: shopWith(), researcher });

    const outcome = await finder.run(answers);

    if (outcome.status !== "results") {
      throw new Error("Expected results");
    }
    const [entry] = outcome.groups;
    expect(entry.whiskies.map((item) => item.whisky.id)).toEqual([
      "entry-a",
      "entry-b",
    ]);
    expect(entry.whiskies[0].reason).toBe("Сладко шери, виж");
    expect(entry.whiskies[1].reason.length).toBeLessThanOrEqual(160);
    expect(entry.whiskies[1].reason.endsWith("…")).toBe(true);
  });

  it("returns an honest empty result when the AI finds nothing relevant", async () => {
    const { researcher } = scriptedResearcher([]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await expect(finder.run(answers)).resolves.toEqual({
      status: "results",
      groups: [],
    });
  });

  it("fails when the AI recommends nothing valid", async () => {
    const { researcher } = scriptedResearcher([rec("ghost"), rec("draft")]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await expect(finder.run(answers)).resolves.toEqual({
      status: "failed",
      cause: "no-valid-results",
    });
  });

  it("fails with the research error kind and never falls back", async () => {
    const researcher: FinderResearcher = {
      async research() {
        throw new FinderResearchError("unavailable", "HTTP 503");
      },
    };
    const finder = createFinder({ shop: shopWith(), researcher });

    await expect(finder.run(answers)).resolves.toEqual({
      status: "failed",
      cause: "unavailable",
    });
  });

  it("fails when the Catalogue cannot load", async () => {
    const { researcher, inputs } = scriptedResearcher([]);
    const finder = createFinder({
      shop: {
        async finderCandidates() {
          throw new Error("db down");
        },
      },
      researcher,
    });

    await expect(finder.run(answers)).resolves.toEqual({
      status: "failed",
      cause: "catalogue-unavailable",
    });
    expect(inputs).toHaveLength(0);
  });

  it("skips research when the chosen Price tier has no Catalogue Whisky", async () => {
    const { researcher, inputs } = scriptedResearcher([]);
    const finder = createFinder({ shop: shopWith(), researcher });

    await expect(
      finder.run({ ...answers, priceTier: "SIGNATURE" }),
    ).resolves.toEqual({ status: "results", groups: [] });
    expect(inputs).toHaveLength(0);
  });
});
