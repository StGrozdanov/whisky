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
      },
      story: "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
      monthLabel: "Март 2025",
    });
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
      },
      {
        name: "Redbreast 12",
        photoUrl: "/bottles/redbreast-12.svg",
        origin: "Irish",
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
