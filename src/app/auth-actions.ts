"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  emptyAuthState,
  loginSchema,
  registerSchema,
  type AuthActionState,
} from "@/lib/auth-input";

function firstIssue(error: ZodError) {
  return error.issues[0]?.message ?? "Sprawdź dane i spróbuj ponownie.";
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 10),
        role: "VIEWER",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ten e-mail jest już zajęty." };
    }
    return { error: "Nie udało się utworzyć konta. Spróbuj ponownie." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Konto powstało, ale logowanie się nie udało. Wejdź z ekranu logowania.",
      };
    }
    throw error;
  }

  return emptyAuthState;
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Nieprawidłowy e-mail lub hasło." };
    }
    throw error;
  }

  return emptyAuthState;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
