"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/(panel)/users/actions";
import { Button } from "@/components/Button";
import { emptyUserState } from "@/lib/user-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm";

export function UserCreateForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    emptyUserState,
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-line bg-card p-5"
    >
      <h2 className="font-medium">Nowe konto</h2>
      <p className="mt-1 text-sm text-muted">
        E-mail i hasło to dane do logowania. Rola od razu wchodzi w życie.
      </p>

      {state.error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 rounded-md border border-line bg-paper px-4 py-3 text-sm">
          {state.success}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Imię
          <input name="name" required minLength={2} className={inputClass} />
        </label>
        <label className="text-sm">
          E-mail (login)
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
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
        <label className="text-sm">
          Rola
          <select name="role" defaultValue="EDITOR" className={inputClass}>
            <option value="ADMIN">admin</option>
            <option value="EDITOR">edytor</option>
            <option value="VIEWER">podgląd</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? "Tworzenie…" : "Dodaj konto"}
        </Button>
      </div>
    </form>
  );
}
