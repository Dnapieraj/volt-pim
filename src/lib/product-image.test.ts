import { describe, expect, it } from "vitest";
import { galleryWouldOverflow, MAX_PRODUCT_IMAGES } from "./product-image";

describe("gallery limits", () => {
  it("blocks more than five photos on a card", () => {
    expect(MAX_PRODUCT_IMAGES).toBe(5);
    expect(galleryWouldOverflow(3, 2)).toBe(false);
    expect(galleryWouldOverflow(3, 3)).toBe(true);
    expect(galleryWouldOverflow(0, 5)).toBe(false);
  });
});
