export default function ImportPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Import z Excela</h1>
      <p className="mt-1 text-sm text-muted">
        Tu wrzucisz plik CSV/XLSX. Na razie tylko wygląd strefy zrzutu.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-copper/40 bg-card px-6 py-14 text-center">
        <p className="font-medium">Upuść plik tutaj</p>
        <p className="mt-1 text-sm text-muted">
          Kolumny: SKU, nazwa, marka, kategoria, cena, stan
        </p>
        <button
          type="button"
          className="mt-5 rounded-md border border-line px-4 py-2 text-sm"
        >
          Wybierz plik (później)
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card p-4 text-sm text-muted">
        Przykład błędów po imporcie: wiersz 12 — puste SKU, wiersz 18 —
        zduplikowany kod MCB-B16.
      </div>
    </div>
  );
}
