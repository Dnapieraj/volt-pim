import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/current-user";

export type AuditEntry = {
  id: string;
  action: AuditAction;
  actorName: string;
  sku: string;
  productName: string;
  summary: string;
  createdAt: Date;
};

export type AuditFilter = {
  action: "ALL" | AuditAction;
  q: string;
  limit?: number;
};

const actionLabel: Record<AuditAction, string> = {
  CREATE: "dodanie karty",
  UPDATE: "edycja karty",
  DELETE: "usunięcie karty",
  IMPORT: "import z pliku",
  BULK_UPDATE: "edycja zbiorcza",
  ACCOUNT: "konto / kategoria",
};

export const auditActionOptions: { value: AuditAction; label: string }[] = [
  { value: "CREATE", label: "dodanie karty" },
  { value: "UPDATE", label: "edycja karty" },
  { value: "DELETE", label: "usunięcie karty" },
  { value: "IMPORT", label: "import z pliku" },
  { value: "BULK_UPDATE", label: "edycja zbiorcza" },
  { value: "ACCOUNT", label: "konto / kategoria" },
];

export function auditActionLabel(action: AuditAction) {
  return actionLabel[action];
}

export function formatAuditTime(date: Date) {
  return date.toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function parseAuditFilter(
  searchParams: Record<string, string | string[] | undefined>,
): AuditFilter {
  const raw = Array.isArray(searchParams.action)
    ? searchParams.action[0]
    : searchParams.action;
  const qRaw = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const known = auditActionOptions.some((item) => item.value === raw);
  return {
    action: known ? (raw as AuditAction) : "ALL",
    q: (qRaw ?? "").trim(),
  };
}

export async function recordAudit(input: {
  actor: SessionUser;
  action: AuditAction;
  sku?: string;
  productName?: string;
  summary: string;
}) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      actorId: input.actor.id,
      actorName: input.actor.name,
      actorEmail: input.actor.email,
      sku: input.sku ?? "",
      productName: input.productName ?? "",
      summary: input.summary,
    },
  });
}

export async function getAuditLogs(
  limitOrFilter: number | AuditFilter = 50,
): Promise<AuditEntry[]> {
  const filter: AuditFilter =
    typeof limitOrFilter === "number"
      ? { action: "ALL", q: "", limit: limitOrFilter }
      : limitOrFilter;
  const where: Prisma.AuditLogWhereInput = {};
  if (filter.action !== "ALL") where.action = filter.action;
  if (filter.q) {
    where.OR = [
      { sku: { contains: filter.q } },
      { actorName: { contains: filter.q } },
      { productName: { contains: filter.q } },
      { summary: { contains: filter.q } },
    ];
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filter.limit ?? 100,
    select: {
      id: true,
      action: true,
      actorName: true,
      sku: true,
      productName: true,
      summary: true,
      createdAt: true,
    },
  });
}
