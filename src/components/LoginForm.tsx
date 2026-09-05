"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/auth-actions";
import { Button } from "@/components/Button";
import { emptyAuthState } from "@/lib/auth-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
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
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue="admin@voltpim.dev"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Hasło
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Logowanie…" : "Wejdź do panelu"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Nie masz konta?{" "}
        <Link href="/register" className="text-copper">
          Rejestracja
        </Link>
      </p>
    </>
  );
}
