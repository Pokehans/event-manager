"use client";

import { useRef, useState, useTransition } from "react";
import { uploadRoomImages } from "./actions";

type RoomImageUploadProps = {
  roomId: string;
};

export function RoomImageUpload({ roomId }: RoomImageUploadProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const result = await uploadRoomImages(roomId, formData);

      setMessage(result.message);

      if (result.success) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input
        type="file"
        name="images"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="block w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-600"
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Bilder werden hochgeladen..." : "Bilder hochladen"}
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}