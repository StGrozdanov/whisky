import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const NOW = new Date("2026-09-16T12:00:00.000Z");

describe("Shop home", () => {
  it("returns the House pick with its story when one is set", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        housePick: {
          whiskyId: "glen",
          story:
            "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
          monthLabel: "Март 2025",
        },
      }),
    });

    const home = await shop.home();

    expect(home.housePick).toEqual({
      whisky: {
        name: "GlenAllachie 12",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        abv: undefined,
        nonChillFiltered: undefined,
      },
      story: "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
      monthLabel: "Март 2025",
      youtubeUrl: undefined,
      note: undefined,
      displayPriceEur: undefined,
    });
  });

  it("returns House pick spotlight fields for ABV, note, price, and YouTube", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            abv: 46.0,
            nonChillFiltered: true,
          },
        ],
        housePick: {
          whiskyId: "glen",
          story:
            "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
          monthLabel: "Октомври 2026",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          note: {
            authorName: "Стоян Грозданов",
            authorRole: "Главен Дегустатор, whiskyfinder.bg",
            score: 9.3,
            quote:
              "„Монументален шери профил. Истинско тържество на Pedro Ximénez и Oloroso бъчвите.“",
          },
          displayPriceEur: 55.2,
        },
      }),
    });

    const home = await shop.home();

    expect(home.housePick).toEqual({
      whisky: {
        name: "GlenAllachie 12",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        abv: 46.0,
        nonChillFiltered: true,
      },
      story: "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
      monthLabel: "Октомври 2026",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      note: {
        authorName: "Стоян Грозданов",
        authorRole: "Главен Дегустатор, whiskyfinder.bg",
        score: 9.3,
        quote:
          "„Монументален шери профил. Истинско тържество на Pedro Ximénez и Oloroso бъчвите.“",
      },
      displayPriceEur: 55.2,
    });
  });

  it("omits the House pick note when author or quote is missing", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        housePick: {
          whiskyId: "glen",
          story: "House story",
          monthLabel: undefined,
          note: {
            authorName: "Стоян Грозданов",
            authorRole: undefined,
            score: undefined,
            quote: undefined,
          },
        },
      }),
    });

    expect((await shop.home()).housePick?.note).toBeUndefined();
  });

  it("returns no House pick when none is set", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
      }),
    });

    expect((await shop.home()).housePick).toBeUndefined();
  });

  it("returns empty rails when the store has none", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore(),
    });

    expect(await shop.home()).toEqual({
      housePick: undefined,
      promotions: [],
      newWhiskies: [],
      discoveryPacks: [],
    });
  });

  it("returns only Shopkeeper-selected New Whiskies with badge, note, and price", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            abv: 46.0,
          },
          {
            id: "yama",
            name: "Yamazaki Distiller's Reserve",
            photoUrl: "/bottles/yamazaki-reserve.svg",
            origin: "Japanese",
            abv: 43.0,
          },
          {
            id: "laph",
            name: "Laphroaig 10",
            photoUrl: "/bottles/laphroaig-10.svg",
            origin: "Scotch",
            abv: 40.0,
          },
        ],
        newWhiskies: [
          {
            whiskyId: "yama",
            displayPriceEur: 72.0,
            badge: "Ново",
            note: "Първо зареждане",
            sortOrder: 1,
          },
          {
            whiskyId: "laph",
            displayPriceEur: 49.5,
            badge: "Ексклузивно",
            note: "Islay класика",
            sortOrder: 2,
          },
        ],
      }),
    });

    expect((await shop.home()).newWhiskies).toEqual([
      {
        whisky: {
          name: "Yamazaki Distiller's Reserve",
          photoUrl: "/bottles/yamazaki-reserve.svg",
          origin: "Japanese",
          abv: 43.0,
          nonChillFiltered: undefined,
        },
        displayPriceEur: 72.0,
        badge: "Ново",
        note: "Първо зареждане",
      },
      {
        whisky: {
          name: "Laphroaig 10",
          photoUrl: "/bottles/laphroaig-10.svg",
          origin: "Scotch",
          abv: 40.0,
          nonChillFiltered: undefined,
        },
        displayPriceEur: 49.5,
        badge: "Ексклузивно",
        note: "Islay класика",
      },
    ]);
  });

  it("returns active promotions with savings and discount percent", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "redbreast",
            name: "Redbreast 12",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
            abv: 40.0,
          },
          {
            id: "buffalo",
            name: "Buffalo Trace",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            abv: 40.0,
          },
        ],
        promotions: [
          {
            whiskyId: "redbreast",
            discountedPriceEur: 42.5,
            priorPriceEur: 50.0,
            startsAt: new Date("2026-01-01T00:00:00.000Z"),
            endsAt: undefined,
            sortOrder: 1,
          },
          {
            whiskyId: "buffalo",
            discountedPriceEur: 28.0,
            priorPriceEur: 35.0,
            startsAt: undefined,
            endsAt: new Date("2026-12-31T23:59:59.000Z"),
            sortOrder: 2,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    expect((await shop.home()).promotions).toEqual([
      {
        whisky: {
          name: "Redbreast 12",
          photoUrl: "/bottles/redbreast-12.svg",
          origin: "Irish",
          abv: 40.0,
          nonChillFiltered: undefined,
        },
        discountedPriceEur: 42.5,
        priorPriceEur: 50.0,
        savingsEur: 7.5,
        discountPercent: 15,
      },
      {
        whisky: {
          name: "Buffalo Trace",
          photoUrl: "/bottles/buffalo-trace.svg",
          origin: "Bourbon",
          abv: 40.0,
          nonChillFiltered: undefined,
        },
        discountedPriceEur: 28.0,
        priorPriceEur: 35.0,
        savingsEur: 7.0,
        discountPercent: 20,
      },
    ]);
  });

  it("omits expired and not-yet-started promotions", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "redbreast",
            name: "Redbreast 12",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
          },
          {
            id: "buffalo",
            name: "Buffalo Trace",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
          },
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        promotions: [
          {
            whiskyId: "redbreast",
            discountedPriceEur: 42.5,
            priorPriceEur: 50.0,
            startsAt: undefined,
            endsAt: new Date("2026-01-01T00:00:00.000Z"),
            sortOrder: 1,
          },
          {
            whiskyId: "buffalo",
            discountedPriceEur: 28.0,
            priorPriceEur: 35.0,
            startsAt: new Date("2026-10-01T00:00:00.000Z"),
            endsAt: undefined,
            sortOrder: 2,
          },
          {
            whiskyId: "glen",
            discountedPriceEur: 49.0,
            priorPriceEur: 55.2,
            startsAt: undefined,
            endsAt: undefined,
            sortOrder: 3,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    expect((await shop.home()).promotions).toEqual([
      {
        whisky: {
          name: "GlenAllachie 12",
          photoUrl: "/bottles/glenallachie-12.svg",
          origin: "Scotch",
          abv: undefined,
          nonChillFiltered: undefined,
        },
        discountedPriceEur: 49.0,
        priorPriceEur: 55.2,
        savingsEur: 6.2,
        discountPercent: 11,
      },
    ]);
  });

  it("returns Discovery Packs with title, price, photo, and ordered lineup", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        discoveryPacks: [
          {
            id: "pack-1",
            title: "Шери срещу Торф (3 x 50ml)",
            photoUrl: "/bottles/glenallachie-12.svg",
            priceEur: 21.5,
            sortOrder: 1,
            lineup: [
              {
                name: "1. GlenAllachie 12",
                detail: "Шери Pedro Ximénez • Speyside",
                sortOrder: 1,
              },
              {
                name: "2. Laphroaig 10",
                detail: "Торф от остров Islay",
                sortOrder: 2,
              },
              {
                name: "3. Redbreast 12",
                detail: "Ирландски пот стил",
                sortOrder: 3,
              },
            ],
          },
        ],
      }),
    });

    expect((await shop.home()).discoveryPacks).toEqual([
      {
        title: "Шери срещу Торф (3 x 50ml)",
        photoUrl: "/bottles/glenallachie-12.svg",
        priceEur: 21.5,
        lineup: [
          {
            name: "1. GlenAllachie 12",
            detail: "Шери Pedro Ximénez • Speyside",
          },
          {
            name: "2. Laphroaig 10",
            detail: "Торф от остров Islay",
          },
          {
            name: "3. Redbreast 12",
            detail: "Ирландски пот стил",
          },
        ],
      },
    ]);
  });

  it("omits rail rows whose whisky is missing", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        promotions: [
          {
            whiskyId: "missing",
            discountedPriceEur: 40.0,
            priorPriceEur: 50.0,
            startsAt: undefined,
            endsAt: undefined,
            sortOrder: 1,
          },
          {
            whiskyId: "glen",
            discountedPriceEur: 49.0,
            priorPriceEur: 55.2,
            startsAt: undefined,
            endsAt: undefined,
            sortOrder: 2,
          },
        ],
        newWhiskies: [
          {
            whiskyId: "ghost",
            displayPriceEur: 60.0,
            badge: "Ново",
            note: "Липсва",
            sortOrder: 1,
          },
          {
            whiskyId: "glen",
            displayPriceEur: 55.2,
            badge: "Ново",
            note: "В наличност",
            sortOrder: 2,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    const home = await shop.home();

    expect(home.promotions).toHaveLength(1);
    expect(home.promotions[0]?.whisky.name).toBe("GlenAllachie 12");
    expect(home.newWhiskies).toHaveLength(1);
    expect(home.newWhiskies[0]?.whisky.name).toBe("GlenAllachie 12");
  });
});
