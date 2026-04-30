"use client";

import { useState } from "react";

type Props = {
  eventId: string;
  action: (formData: FormData) => Promise<void>;
};

export function ArchiveEventButton({ eventId, action }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
      >
        Event archivieren
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="section-title">Event archivieren</h2>
            <p className="section-text mt-1">
              Das Debriefing ist Pflicht. Nach der Archivierung kann das Event
              nicht mehr bearbeitet werden.
            </p>

            <form action={action} className="mt-5 space-y-4">
              <input type="hidden" name="eventId" value={eventId} />

              <textarea
                name="debriefing"
                rows={6}
                required
                minLength={10}
                placeholder="Debriefing / Nachbereitung eintragen..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium"
                >
                  Abbrechen
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Archivieren
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}