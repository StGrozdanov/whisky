import { describe, expect, it } from "vitest";
import {
  buildCatalogueHref,
  catalogueHasActiveFilters,
  parseCatalogueQuery,
  searchHitHref,
} from "./parse-catalogue-query";

describe("catalogue search query", () => {
  it("keeps Whisky, Distillery, Country, Region, and typed query in the URL", () => {
    const query = parseCatalogueQuery({
      name: "GlenAllachie 12",
      distillery: "GlenAllachie",
      country: "Шотландия",
      region: "Speyside",
      q: "glen",
      page: "2",
    });

    expect(query).toEqual({
      name: "GlenAllachie 12",
      distillery: "GlenAllachie",
      country: "Шотландия",
      region: "Speyside",
      q: "glen",
      page: 2,
    });
    expect(catalogueHasActiveFilters(query)).toBe(true);
    expect(buildCatalogueHref(query, { page: 3 })).toBe(
      "/catalogue?name=GlenAllachie+12&distillery=GlenAllachie&country=%D0%A8%D0%BE%D1%82%D0%BB%D0%B0%D0%BD%D0%B4%D0%B8%D1%8F&region=Speyside&q=glen&page=3",
    );
  });

  it("links a search suggestion to the matching Catalogue filter", () => {
    expect(searchHitHref({ kind: "whisky", name: "GlenAllachie 12" })).toBe(
      "/catalogue?name=GlenAllachie+12",
    );
    expect(searchHitHref({ kind: "distillery", name: "GlenAllachie" })).toBe(
      "/catalogue?distillery=GlenAllachie",
    );
    expect(searchHitHref({ kind: "country", name: "Шотландия" })).toBe(
      "/catalogue?country=%D0%A8%D0%BE%D1%82%D0%BB%D0%B0%D0%BD%D0%B4%D0%B8%D1%8F",
    );
    expect(searchHitHref({ kind: "region", name: "Speyside" })).toBe(
      "/catalogue?region=Speyside",
    );
  });

  it("ignores blank search params", () => {
    const query = parseCatalogueQuery({ name: "  ", q: "" });

    expect(query).toEqual({});
    expect(catalogueHasActiveFilters(query)).toBe(false);
    expect(buildCatalogueHref(query)).toBe("/catalogue");
  });
});
