import { z } from "zod";
import { isAppRole, type AppRole } from "@/lib/permissions";

export type UserActionState = {
  error: string;
  success: string;
};

export const emptyUserState: UserActionState = { error: "", success: "" };

export const roleSchema = z
  .string()
  .refine(isAppRole, "Wybierz rolę: admin, edytor albo podgląd.");

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Podaj imię (min. 2 znaki).")
    .max(80, "Imię jest za długie."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Podaj poprawny e-mail."),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków.")
    .max(72, "Hasło jest za długie."),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  id: z.string().trim().min(1, "Brak identyfikatora konta."),
  name: z
    .string()
    .trim()
    .min(2, "Podaj imię (min. 2 znaki).")
    .max(80, "Imię jest za długie."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Podaj poprawny e-mail."),
  password: z
    .string()
    .max(72, "Hasło jest za długie.")
    .refine(
      (value) => value.length === 0 || value.length >= 8,
      "Nowe hasło musi mieć co najmniej 8 znaków albo zostaw puste.",
    ),
  role: roleSchema,
});

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: AppRole;
};

export type UpdateUserInput = {
  name: string;
  email: string;
  password: string;
  role: AppRole;
};

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Podaj imię (min. 2 znaki).")
    .max(80, "Imię jest za długie."),
  currentPassword: z.string().min(1, "Podaj obecne hasło."),
  newPassword: z
    .string()
    .max(72, "Hasło jest za długie.")
    .refine(
      (value) => value.length === 0 || value.length >= 8,
      "Nowe hasło musi mieć co najmniej 8 znaków albo zostaw puste.",
    ),
});
