import { z } from "zod";

export type AuthActionState = {
  error: string;
};

export const emptyAuthState: AuthActionState = { error: "" };

export const registerSchema = z.object({
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
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Podaj poprawny e-mail."),
  password: z.string().min(1, "Podaj hasło."),
});
