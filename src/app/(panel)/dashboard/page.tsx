import { ButtonLink } from "@/components/Button";
import { auditPreview, stats } from "@/lib/mock";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Pulpit</h1>
      <p className="mt-1 text-sm text-muted">
        Szybki podgląd katalogu. Liczby na razie z przykładu.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-line bg-card p-4"
          >
            <div className="text-xs text-muted">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-medium">Ostatnie zmiany</h2>
          <ul className="mt-4 divide-y divide-line">
            {auditPreview.map((row) => (
              <li key={row.what + row.when} className="py-3 text-sm">
                <span className="font-medium">{row.who}</span> {row.action}{" "}
                <span className="text-copper">{row.what}</span>
                <div className="text-xs text-muted">{row.when}</div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-medium">Co tu będzie</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Logowanie i role (admin / edytor / podgląd)</li>
            <li>Prawdziwa baza MariaDB / PostgreSQL</li>
            <li>CRUD produktów przez REST API</li>
            <li>Import Excela z raportem błędów</li>
          </ol>
          <ButtonLink href="/products" variant="dark" className="mt-5 w-full">
            Przejdź do produktów
          </ButtonLink>
        </section>
      </div>
    </div>
  );
}
