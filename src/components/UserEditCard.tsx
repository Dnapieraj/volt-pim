"use client";

import { useActionState } from "react";
import {
  deleteUserAction,
  updateUserAction,
} from "@/app/(panel)/users/actions";
import { Button } from "@/components/Button";
import { roleLabel, type AppRole } from "@/lib/permissions";
import { emptyUserState } from "@/lib/user-input";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm";

export function UserEditCard({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: AppRole };
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateUserAction,
    emptyUserState,
  );
  const [deleteState, deleteFormAction, deleting] = useActionState(
    deleteUserAction,
    emptyUserState,
  );

  return (
    <article className="rounded-lg border border-line bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">{user.name}</h2>
        <p className="text-xs text-muted">
          {isSelf ? "to Twoje konto · " : ""}
          {roleLabel[user.role]}
        </p>
      </div>

      {state.error || deleteState.error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn"
        >
          {state.error || deleteState.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 rounded-md border border-line bg-paper px-4 py-3 text-sm">
          {state.success}
        </p>
      ) : null}

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={user.id} />
        <label className="text-sm">
          Imię
          <input
            name="name"
            required
            minLength={2}
            defaultValue={user.name}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          E-mail (login)
          <input
            name="email"
            type="email"
            required
            defaultValue={user.email}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          Nowe hasło
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="puste = bez zmiany"
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          Rola
          <select name="role" defaultValue={user.role} className={inputClass}>
            <option value="ADMIN">admin</option>
            <option value="EDITOR">edytor</option>
            <option value="VIEWER">podgląd</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Zapisywanie…" : "Zapisz konto"}
          </Button>
        </div>
      </form>

      {isSelf ? (
        <p className="mt-3 text-xs text-muted">
          Własnego konta nie usuniesz. Zmiana roli na inną niż admin wyrzuci
          Cię z tej strony.
        </p>
      ) : (
        <form
          action={deleteFormAction}
          className="mt-3"
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Usunąć konto ${user.email}? Ta osoba nie zaloguje się ponownie.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={user.id} />
          <Button type="submit" variant="ghost" disabled={deleting}>
            {deleting ? "Usuwanie…" : "Usuń konto"}
          </Button>
        </form>
      )}
    </article>
  );
}
