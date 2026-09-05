"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/auth-actions";
import { Button } from "@/components/Button";
import { emptyAuthState } from "@/lib/auth-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    emptyAuthState,
  );

  return (
    <>
      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
        >
          {state.error}
        </p>
      ) : null}
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm">
          Imię
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Anna"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="anna@hurtownia.pl"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Hasło
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Tworzenie konta…" : "Utwórz konto"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Masz już konto?{" "}
        <Link href="/login" className="text-copper">
          Logowanie
        </Link>
      </p>
    </>
  );
}
