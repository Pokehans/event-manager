"use client";

import { useFormStatus } from "react-dom";

type DeleteEventButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  eventId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Wird gelöscht..." : "Event löschen"}
    </button>
  );
}

export default function DeleteEventButton({
  action,
  eventId,
}: DeleteEventButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Möchtest du dieses Event wirklich endgültig löschen? Dieser Vorgang kann nicht rückgängig gemacht werden."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={eventId} />
      <SubmitButton />
    </form>
  );
}