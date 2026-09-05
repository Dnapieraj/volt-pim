import type { AuditAction } from "@prisma/client";
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

const actionLabel: Record<AuditAction, string> = {
  CREATE: "dodanie karty",
  UPDATE: "edycja karty",
  DELETE: "usunięcie karty",
  IMPORT: "import z pliku",
};

export function auditActionLabel(action: AuditAction) {
  return actionLabel[action];
}

export function formatAuditTime(date: Date) {
  return date.toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

export async function getAuditLogs(limit = 50): Promise<AuditEntry[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
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
