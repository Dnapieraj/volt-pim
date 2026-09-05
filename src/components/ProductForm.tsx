"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import {
  categories,
  emptyProduct,
  type Product,
  type ProductAttribute,
  units,
} from "@/lib/product";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-ink";

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}

type Props = {
  product?: Product;
  mode: "create" | "edit";
};

export function ProductForm({ product, mode }: Props) {
  const initial = product ?? emptyProduct;
  const [saved, setSaved] = useState(false);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    initial.attributes.length ? initial.attributes : [{ key: "", value: "" }],
  );
  const [substitutes, setSubstitutes] = useState<string[]>(
    initial.substitutes.length ? initial.substitutes : [""],
  );

  function addAttribute() {
    setAttributes((rows) => [...rows, { key: "", value: "" }]);
  }

  function removeAttribute(index: number) {
    setAttributes((rows) => rows.filter((_, i) => i !== index));
  }

  function updateAttribute(index: number, field: keyof ProductAttribute, value: string) {
    setAttributes((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addSubstitute() {
    setSubstitutes((rows) => [...rows, ""]);
  }

  function removeSubstitute(index: number) {
    setSubstitutes((rows) => rows.filter((_, i) => i !== index));
  }

  return (
    <form
      className="mt-6 space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      {saved ? (
        <p className="rounded-md border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
          Karta wygląda na zapisaną. Prawdziwy zapis w bazie dołączymy w kolejnym
          kroku — na razie nic nie znika po odświeżeniu.
        </p>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Identyfikacja</h2>
        <Field label="SKU">
          <input
            name="sku"
            required
            defaultValue={initial.sku}
            placeholder="YDY-5X2.5"
            className={inputClass}
          />
        </Field>
        <Field label="EAN / kod kreskowy">
          <input
            name="ean"
            defaultValue={initial.ean}
            placeholder="5901234123457"
            className={inputClass}
          />
        </Field>
        <Field label="Kod producenta">
          <input
            name="manufacturerCode"
            defaultValue={initial.manufacturerCode}
            placeholder="A9F03116"
            className={inputClass}
          />
        </Field>
        <Field label="Marka">
          <input
            name="brand"
            defaultValue={initial.brand}
            placeholder="Schneider"
            className={inputClass}
          />
        </Field>
        <Field label="Nazwa" wide>
          <input
            name="name"
            required
            defaultValue={initial.name}
            placeholder="Wyłącznik nadprądowy B16 1P"
            className={inputClass}
          />
        </Field>
        <Field label="Kategoria">
          <select
            name="category"
            defaultValue={initial.category}
            className={inputClass}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Status karty">
          <select name="status" defaultValue={initial.status} className={inputClass}>
            <option value="DRAFT">Szkic</option>
            <option value="ACTIVE">Aktywny</option>
            <option value="ARCHIVED">Archiwum</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Cena i magazyn</h2>
        <Field label="Cena netto (PLN)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial.price || ""}
            className={inputClass}
          />
        </Field>
        <Field label="VAT (%)">
          <select name="vat" defaultValue={String(initial.vat)} className={inputClass}>
            <option value="23">23%</option>
            <option value="8">8%</option>
            <option value="5">5%</option>
            <option value="0">0%</option>
          </select>
        </Field>
        <Field label="Jednostka">
          <select name="unit" defaultValue={initial.unit} className={inputClass}>
            {units.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Stan magazynowy">
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={initial.stock}
            className={inputClass}
          />
        </Field>
        <Field label="Min. zamówienie">
          <input
            name="minOrder"
            type="number"
            min="1"
            defaultValue={initial.minOrder}
            className={inputClass}
          />
        </Field>
        <Field label="Ilość w opakowaniu">
          <input
            name="packageQty"
            type="number"
            min="1"
            defaultValue={initial.packageQty}
            className={inputClass}
          />
        </Field>
        <Field label="Lokalizacja w magazynie">
          <input
            name="warehouseLocation"
            defaultValue={initial.warehouseLocation}
            placeholder="A-12-04"
            className={inputClass}
          />
        </Field>
        <Field label="Waga (kg)">
          <input
            name="weightKg"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial.weightKg || ""}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2">
        <h2 className="text-sm font-medium sm:col-span-2">Parametry techniczne</h2>
        <Field label="Napięcie">
          <input
            name="voltage"
            defaultValue={initial.voltage}
            placeholder="230/400 V"
            className={inputClass}
          />
        </Field>
        <Field label="Prąd">
          <input
            name="current"
            defaultValue={initial.current}
            placeholder="16 A"
            className={inputClass}
          />
        </Field>
        <Field label="Stopień IP">
          <input
            name="ipRating"
            defaultValue={initial.ipRating}
            placeholder="IP44"
            className={inputClass}
          />
        </Field>
        <Field label="Opis" wide>
          <textarea
            name="description"
            rows={3}
            defaultValue={initial.description}
            className={inputClass}
          />
        </Field>
        <Field label="Notatka wewnętrzna (nie na kartę klienta)" wide>
          <textarea
            name="notes"
            rows={2}
            defaultValue={initial.notes}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="rounded-lg border border-line bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Atrybuty (jak w PIM)</h2>
          <Button type="button" variant="ghost" className="py-1.5" onClick={addAttribute}>
            Dodaj atrybut
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Dowolne pary: przekrój, bieguny, moc, barwa światła…
        </p>
        <div className="mt-4 space-y-2">
          {attributes.map((row, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={row.key}
                onChange={(event) => updateAttribute(index, "key", event.target.value)}
                placeholder="Nazwa parametru"
                className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
              <input
                value={row.value}
                onChange={(event) =>
                  updateAttribute(index, "value", event.target.value)
                }
                placeholder="Wartość"
                className="rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                className="py-1.5"
                onClick={() => removeAttribute(index)}
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Zamienniki (SKU)</h2>
          <Button type="button" variant="ghost" className="py-1.5" onClick={addSubstitute}>
            Dodaj zamiennik
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {substitutes.map((sku, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={sku}
                onChange={(event) =>
                  setSubstitutes((rows) =>
                    rows.map((item, i) => (i === index ? event.target.value : item)),
                  )
                }
                placeholder="MCB-C16"
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                className="py-1.5"
                onClick={() => removeSubstitute(index)}
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="dark">
          {mode === "create" ? "Utwórz kartę" : "Zapisz zmiany"}
        </Button>
        <ButtonLink
          href={mode === "edit" && product ? `/products/${product.id}` : "/products"}
          variant="ghost"
        >
          Anuluj
        </ButtonLink>
      </div>
    </form>
  );
}
