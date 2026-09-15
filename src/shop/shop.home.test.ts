import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

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

  it("returns live Whiskies for home rails", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
          {
            id: "redbreast",
            name: "Redbreast 12",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
          },
        ],
        housePick: {
          whiskyId: "glen",
          story: "House story",
          monthLabel: undefined,
        },
      }),
    });

    expect((await shop.home()).whiskies).toEqual([
      {
        name: "GlenAllachie 12",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        abv: undefined,
        nonChillFiltered: undefined,
      },
      {
        name: "Redbreast 12",
        photoUrl: "/bottles/redbreast-12.svg",
        origin: "Irish",
        abv: undefined,
        nonChillFiltered: undefined,
      },
    ]);
  });

  it("returns an empty whisky rail when the store has none", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore(),
    });

    expect(await shop.home()).toEqual({
      housePick: undefined,
      whiskies: [],
    });
  });
});
