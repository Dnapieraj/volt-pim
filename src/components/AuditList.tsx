import {
  auditActionLabel,
  formatAuditTime,
  type AuditEntry,
} from "@/lib/audit";

export function AuditList({
  entries,
  empty,
  boxed,
}: {
  entries: AuditEntry[];
  empty: string;
  boxed?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p
        className={
          boxed
            ? "rounded-lg border border-line bg-card px-5 py-10 text-center text-sm text-muted"
            : "py-6 text-sm text-muted"
        }
      >
        {empty}
      </p>
    );
  }

  return (
    <ul
      className={
        boxed
          ? "divide-y divide-line rounded-lg border border-line bg-card"
          : "divide-y divide-line"
      }
    >
      {entries.map((row) => (
        <li key={row.id} className={boxed ? "px-5 py-4" : "py-3"}>
          <div className="text-sm">
            <span className="font-medium">{row.actorName}</span>{" "}
            {auditActionLabel(row.action)}
            {row.sku ? (
              <>
                {" "}
                <span className="text-copper">{row.sku}</span>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">{row.summary}</p>
          {row.productName && row.action !== "IMPORT" ? (
            <p className="mt-1 text-xs text-muted">{row.productName}</p>
          ) : null}
          <div className="mt-1 text-xs text-muted">
            {formatAuditTime(row.createdAt)}
          </div>
        </li>
      ))}
    </ul>
  );
}
