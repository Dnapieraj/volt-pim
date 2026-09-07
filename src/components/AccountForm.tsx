"use client";

import { useActionState } from "react";
import { updateAccountAction } from "@/app/(panel)/account/actions";
import { Button } from "@/components/Button";
import { roleLabel, type AppRole } from "@/lib/permissions";
import { emptyUserState } from "@/lib/user-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 min-h-11";

export function AccountForm({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: AppRole;
}) {
  const [state, formAction, pending] = useActionState(
    updateAccountAction,
    emptyUserState,
  );

  return (
    <form
      action={formAction}
      className="mt-6 max-w-lg space-y-4 rounded-lg border border-line bg-card p-5"
    >
      <p className="text-sm text-muted">
        Login: <span className="font-medium text-ink">{email}</span> · rola{" "}
        {roleLabel[role]}. Rolę zmienia tylko administrator.
      </p>
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-line bg-paper px-4 py-3 text-sm">
          {state.success}
        </p>
      ) : null}
      <label className="block text-sm">
        Imię wyświetlane
        <input
          name="name"
          required
          minLength={2}
          defaultValue={name}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Obecne hasło
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Nowe hasło (puste = bez zmiany)
        <input
          name="newPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zapisz profil"}
      </Button>
    </form>
  );
}
