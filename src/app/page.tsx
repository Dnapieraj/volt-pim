import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-copper uppercase">
            Hurtownia
          </div>
          <div className="text-xl font-semibold">Volt PIM</div>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="px-4 py-2 text-muted hover:text-ink">
            Logowanie
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-ink px-4 py-2 text-white hover:bg-copper-dark"
          >
            Otwórz panel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">
        <p className="text-sm text-copper">Katalog B2B · wersja wyglądu</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight">
          Karty produktów, atrybuty i zamienniki — jak w hurtowni, nie jak ToDo.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Na razie klikasz po ekranach. Logowanie, baza i import Excela dojdą w
          kolejnych krokach.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-white hover:bg-copper-dark"
          >
            Zobacz pulpit
          </Link>
          <Link
            href="/products"
            className="rounded-md border border-line bg-card px-5 py-2.5 text-sm hover:border-ink/20"
          >
            Lista produktów
          </Link>
        </div>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Karty SKU",
              body: "Nazwa, cena, stan, kategoria, status.",
            },
            {
              title: "Zamienniki",
              body: "Powiązania między produktami, jak w PIM.",
            },
            {
              title: "Import",
              body: "Miejsce na Excel — na razie tylko makieta.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-line bg-card p-5"
            >
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
