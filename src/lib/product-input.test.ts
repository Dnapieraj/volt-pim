import { describe, expect, it } from "vitest";
import { parseProductForm } from "./product-input";

function form(entries: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) data.append(key, item);
    } else {
      data.set(key, value);
    }
  }
  return data;
}

describe("parseProductForm", () => {
  it("accepts a valid card and prefers a newly typed category", () => {
    const parsed = parseProductForm(
      form({
        sku: "MCB-B16",
        name: "Wyłącznik B16",
        category: "Aparatura",
        newCategory: "Zabezpieczenia",
        unit: "szt.",
        price: "12,40".replace(",", "."),
        vat: "23",
        stock: "4",
        minOrder: "1",
        packageQty: "1",
        status: "ACTIVE",
        substituteSku: ["YDY-3X2.5", "YDY-3X2.5", ""],
        attributeKey: ["Bieguny", ""],
        attributeValue: ["1P", ""],
      }),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.category).toBe("Zabezpieczenia");
    expect(parsed.data.substitutes).toEqual(["YDY-3X2.5"]);
    expect(parsed.data.attributes).toEqual([{ key: "Bieguny", value: "1P" }]);
  });

  it("rejects a missing name", () => {
    const parsed = parseProductForm(
      form({
        sku: "X",
        name: "",
        category: "Przewody",
        unit: "szt.",
        status: "DRAFT",
      }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.error).toMatch(/nazwę/i);
  });
});
