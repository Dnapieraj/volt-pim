import Link from "next/link";
import { ButtonLink } from "@/components/Button";

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
          <Link href="/register" className="px-4 py-2 text-muted hover:text-ink">
            Rejestracja
          </Link>
          <ButtonLink href="/login" variant="dark">
            Logowanie
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">
        <p className="text-sm text-copper">Katalog B2B · MariaDB</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight">
          Karty produktów, atrybuty i zamienniki — jak w hurtowni, nie jak ToDo.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Zaloguj się, żeby wejść do panelu. Karty SKU i import Excela
          zapisują się w bazie. Historia zmian dojdzie w kolejnym kroku.
        </p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/login">Zaloguj się do panelu</ButtonLink>
          <ButtonLink href="/register" variant="ghost">
            Załóż konto
          </ButtonLink>
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
              body: "CSV/XLSX z raportem błędów po wierszach.",
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
