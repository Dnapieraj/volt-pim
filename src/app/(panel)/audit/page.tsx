import { auditPreview } from "@/lib/mock";

export default function AuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Historia zmian</h1>
      <p className="mt-1 text-sm text-muted">
        Kto, kiedy, co zmienił. Na razie przykładowe wpisy.
      </p>
      <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-card">
        {auditPreview.map((row) => (
          <li key={row.what + row.when} className="px-5 py-4">
            <div className="text-sm">
              <span className="font-medium">{row.who}</span> {row.action}{" "}
              <span className="text-copper">{row.what}</span>
            </div>
            <div className="mt-1 text-xs text-muted">{row.when}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
