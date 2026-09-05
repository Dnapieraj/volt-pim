import type { ProductStatus } from "@/lib/mock";

const labels: Record<ProductStatus, string> = {
  ACTIVE: "Aktywny",
  DRAFT: "Szkic",
  ARCHIVED: "Archiwum",
};

const classes: Record<ProductStatus, string> = {
  ACTIVE: "bg-ok/10 text-ok",
  DRAFT: "bg-warn/10 text-warn",
  ARCHIVED: "bg-off/15 text-off",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[status]}`}
    >
      {labels[status]}
    </span>
  );
}
