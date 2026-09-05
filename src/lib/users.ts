import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isAppRole,
  type AppRole,
} from "@/lib/permissions";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/user-input";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  createdAt: Date;
};

export type UserWriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function mapUser(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): ManagedUser | null {
  if (!isAppRole(row.role)) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export async function getManagedUsers(): Promise<ManagedUser[]> {
  const rows = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  return rows.flatMap((row) => {
    const user = mapUser(row);
    return user ? [user] : [];
  });
}

async function adminCount() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

function uniqueEmailError(error: unknown): UserWriteResult | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return { ok: false, error: "Ten e-mail jest już zajęty." };
  }
  return null;
}

export async function createManagedUser(
  input: CreateUserInput,
): Promise<UserWriteResult> {
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, 10),
        role: input.role,
      },
    });
    return { ok: true, id: user.id };
  } catch (error) {
    return (
      uniqueEmailError(error) ?? {
        ok: false,
        error: "Nie udało się utworzyć konta.",
      }
    );
  }
}

export async function updateManagedUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserWriteResult> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Nie znaleziono konta." };
  }

  if (
    existing.role === "ADMIN" &&
    input.role !== "ADMIN" &&
    (await adminCount()) <= 1
  ) {
    return {
      ok: false,
      error: "Nie można zdjąć roli z ostatniego administratora.",
    };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        ...(input.password
          ? { passwordHash: await hash(input.password, 10) }
          : {}),
      },
    });
    return { ok: true, id };
  } catch (error) {
    return (
      uniqueEmailError(error) ?? {
        ok: false,
        error: "Nie udało się zapisać konta.",
      }
    );
  }
}

export async function deleteManagedUser(
  id: string,
  actorId: string,
): Promise<UserWriteResult> {
  if (id === actorId) {
    return { ok: false, error: "Nie możesz usunąć własnego konta." };
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Nie znaleziono konta." };
  }

  if (existing.role === "ADMIN" && (await adminCount()) <= 1) {
    return {
      ok: false,
      error: "Nie można usunąć ostatniego administratora.",
    };
  }

  await prisma.user.delete({ where: { id } });
  return { ok: true, id };
}
