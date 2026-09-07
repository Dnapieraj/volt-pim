import { ButtonLink } from "@/components/Button";
import { PublicHeader } from "@/components/PublicHeader";

const features = [
  {
    title: "Karty SKU",
    body: "Zdjęcie, EAN, cena, stan, atrybuty PIM i status szkic / aktywny / archiwum.",
  },
  {
    title: "Zamienniki",
    body: "Powiązania między kartami z podpowiedzią SKU i linkiem do zamiennika.",
  },
  {
    title: "Excel i CSV",
    body: "Import z raportem błędów per wiersz, eksport z tymi samymi filtrami co lista.",
  },
  {
    title: "Role i audyt",
    body: "Admin, edytor, podgląd. Historia kto zmienił kartę, import, konto albo kategorię.",
  },
  {
    title: "Edycja zbiorcza",
    body: "Zaznacz karty na stronie i zmień status albo kategorię za jednym razem.",
  },
  {
    title: "Szukanie w bazie",
    body: "Filtry, sortowanie i paginacja idą do MariaDB — nie filtrują tylko DOM.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <p className="text-sm text-copper">Katalog B2B · Next.js · MariaDB</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          PIM dla hurtowni: karty produktów, nie lista ToDo.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Panel katalogowy z rolami, zdjęciami, importem Excela i historią zmian
          w bazie. Zbudowany tak, żeby pokazać prawdziwy full-stack — od
          logowania po paginację.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/login" className="min-h-11">
            Wejdź do panelu
          </ButtonLink>
          <ButtonLink href="/register" variant="ghost" className="min-h-11">
            Załóż konto (rola: podgląd)
          </ButtonLink>
        </div>

        <aside className="mt-10 rounded-lg border border-line bg-card p-5 text-sm">
          <p className="font-medium">Konta demo (hasło haslo123)</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li>
              <span className="font-medium text-ink">admin@voltpim.dev</span> —
              pełny dostęp, użytkownicy, usuwanie kart
            </li>
            <li>
              <span className="font-medium text-ink">edytor@voltpim.dev</span> —
              karty, import, kategorie
            </li>
            <li>
              <span className="font-medium text-ink">podglad@voltpim.dev</span>{" "}
              — tylko odczyt
            </li>
          </ul>
        </aside>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
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
