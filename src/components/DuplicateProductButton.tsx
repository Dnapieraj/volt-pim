"use client";

import { useActionState } from "react";
import { duplicateProductAction } from "@/app/(panel)/products/actions";
import { Button } from "@/components/Button";
import { emptyActionState } from "@/lib/product-input";

export function DuplicateProductButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    duplicateProductAction,
    emptyActionState,
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Kopiowanie…" : "Duplikuj kartę"}
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-warn">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
