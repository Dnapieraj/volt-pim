import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Nowa karta produktu</h1>
      <p className="mt-1 text-sm text-muted">
        Formularz wygląda jak docelowy. Zapis do bazy zrobimy później.
      </p>

      <form className="mt-6 grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2">
        <label className="text-sm sm:col-span-1">
          SKU
          <input
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            placeholder="YDY-5X2.5"
          />
        </label>
        <label className="text-sm">
          Marka
          <input
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            placeholder="Bitner"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Nazwa
          <input
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            placeholder="Przewód YDY 5×2,5 mm²"
          />
        </label>
        <label className="text-sm">
          Kategoria
          <select className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2">
            <option>Przewody</option>
            <option>Aparatura</option>
            <option>Osprzęt</option>
            <option>Oświetlenie</option>
          </select>
        </label>
        <label className="text-sm">
          Jednostka
          <input
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            defaultValue="szt."
          />
        </label>
        <label className="text-sm">
          Cena (PLN)
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            placeholder="0.00"
          />
        </label>
        <label className="text-sm">
          Stan magazynowy
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            placeholder="0"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Opis
          <textarea
            rows={3}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
          />
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="button"
            className="rounded-md bg-ink px-4 py-2 text-sm text-white"
          >
            Zapisz (nieaktywne)
          </button>
          <Link
            href="/products"
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}
