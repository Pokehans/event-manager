"use client";

import { useState, useTransition } from "react";
import { deleteRoomImage } from "./actions";

type DeleteRoomImageButtonProps = {
  roomId: string;
  imageId: string;
  filePath: string;
};

export function DeleteRoomImageButton({
  roomId,
  imageId,
  filePath,
}: DeleteRoomImageButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Bild wirklich löschen?");

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await deleteRoomImage(roomId, imageId, filePath);
      setMessage(result.success ? null : result.message);
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Löschen..." : "Löschen"}
      </button>

      {message ? <p className="text-xs text-red-300">{message}</p> : null}
    </div>
  );
}