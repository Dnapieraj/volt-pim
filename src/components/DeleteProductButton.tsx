"use client";

import { useActionState } from "react";
import { deleteProductAction } from "@/app/(panel)/products/actions";
import { Button } from "@/components/Button";
import { emptyActionState } from "@/lib/product-input";

export function DeleteProductButton({
  id,
  sku,
}: {
  id: string;
  sku: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    emptyActionState,
  );

  return (
    <form
      action={formAction}
      className="inline-flex flex-col items-start gap-2"
      onSubmit={(event) => {
        if (
          !window.confirm(`Usunąć kartę ${sku}? Tej operacji nie cofniesz.`)
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Usuwanie…" : "Usuń kartę"}
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-warn">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
