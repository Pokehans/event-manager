"use client";

import { useTransition } from "react";
import { deleteOfferItem } from "./actions";

type Props = {
  itemId: string;
  itemName: string;
};

export function DeleteOfferItemButton({ itemId, itemName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Möchtest du die Position "${itemName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(() => {
      deleteOfferItem(itemId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Wird gelöscht..." : "Löschen"}
    </button>
  );
}