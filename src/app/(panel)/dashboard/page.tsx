import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { AuditList } from "@/components/AuditList";
import { getAuditLogs } from "@/lib/audit";
import { getDashboardStats } from "@/lib/catalog";
import { requireSessionUser } from "@/lib/current-user";
import { canWriteProducts } from "@/lib/permissions";

export const metadata = { title: "Pulpit" };

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const [stats, entries] = await Promise.all([
    getDashboardStats(),
    getAuditLogs(6),
  ]);
  const canWrite = canWriteProducts(user.role);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pulpit</h1>
      <p className="mt-1 text-sm text-muted">
        Liczby i historia biorą się na żywo z MariaDB.
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
          <AuditList
            entries={entries}
            empty="Jeszcze nic nie zapisano. Edytuj kartę albo zrób import."
          />
          <Link href="/audit" className="mt-4 inline-block text-sm text-copper">
            Pełna historia zmian
          </Link>
        </section>
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-medium">Szybkie akcje</h2>
          <p className="mt-3 text-sm text-muted">
            Katalog SKU ze zdjęciami, zamiennikami i importem Excela. Role:
            admin, edytor, podgląd.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink href="/products" variant="dark" className="w-full">
              Przejdź do produktów
            </ButtonLink>
            {canWrite ? (
              <ButtonLink href="/products/new" variant="ghost" className="w-full">
                Nowa karta
              </ButtonLink>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
