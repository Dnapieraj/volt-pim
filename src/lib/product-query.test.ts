import { describe, expect, it } from "vitest";
import {
  catalogPageCount,
  catalogQueryString,
  clampPage,
  parseCatalogQuery,
} from "./product-query";

describe("parseCatalogQuery", () => {
  it("returns defaults for empty params", () => {
    expect(parseCatalogQuery({})).toEqual({
      q: "",
      status: "ALL",
      category: "ALL",
      sort: "sku",
      page: 1,
    });
  });

  it("reads filters and ignores unknown values", () => {
    expect(
      parseCatalogQuery({
        q: "  YDY  ",
        status: "draft",
        category: "Przewody",
        sort: "price",
        page: "3",
      }),
    ).toEqual({
      q: "YDY",
      status: "DRAFT",
      category: "Przewody",
      sort: "price",
      page: 3,
    });

    expect(
      parseCatalogQuery({
        status: "nope",
        sort: "random",
        page: "-2",
      }),
    ).toMatchObject({ status: "ALL", sort: "sku", page: 1 });
  });
});

describe("catalogQueryString", () => {
  it("omits default values so URLs stay short", () => {
    expect(catalogQueryString({})).toBe("");
    expect(catalogQueryString({ q: "ean", page: 2 })).toBe("?q=ean&page=2");
    expect(catalogQueryString({ sort: "sku", status: "ALL" })).toBe("");
  });

  it("can append extra params for export", () => {
    expect(catalogQueryString({ q: "led" }, { format: "csv" })).toBe(
      "?q=led&format=csv",
    );
  });
});

describe("pagination helpers", () => {
  it("never returns zero pages", () => {
    expect(catalogPageCount(0)).toBe(1);
    expect(catalogPageCount(20)).toBe(1);
    expect(catalogPageCount(21)).toBe(2);
  });

  it("clamps the page into range", () => {
    expect(clampPage(0, 50)).toBe(1);
    expect(clampPage(9, 50)).toBe(3);
  });
});
