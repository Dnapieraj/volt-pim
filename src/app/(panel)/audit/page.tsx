import { AuditList } from "@/components/AuditList";
import { getAuditLogs } from "@/lib/audit";

export default async function AuditPage() {
  const entries = await getAuditLogs(100);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Historia zmian</h1>
      <p className="mt-1 text-sm text-muted">
        Kto, kiedy, co zmienił — wpisy z MariaDB po edycji kart i imporcie.
      </p>
      <div className="mt-6">
        <AuditList
          boxed
          entries={entries}
          empty="Brak wpisów. Historia pojawi się po dodaniu, edycji, usunięciu albo imporcie kart."
        />
      </div>
    </div>
  );
}
