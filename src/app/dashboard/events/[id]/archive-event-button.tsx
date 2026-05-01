"use client";

import { useState } from "react";

type Props = {
  eventId: string;
  action: (formData: FormData) => Promise<void>;
};

const ratingOptions = [
  { value: "sehr_gut", label: "Sehr gut" },
  { value: "gut", label: "Gut" },
  { value: "neutral", label: "Neutral" },
  { value: "schlecht", label: "Schlecht" },
];

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
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="section-title">Event archivieren</h2>
            <p className="section-text mt-1">
              Das Debriefing ist Pflicht. Nach der Archivierung kann das Event
              nicht mehr bearbeitet werden.
            </p>

            <form action={action} className="mt-5 space-y-5">
              <input type="hidden" name="eventId" value={eventId} />

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">
                  Wie lief das Event?
                </legend>

                <div className="grid gap-2 sm:grid-cols-2">
                  {ratingOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        required
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label
                  htmlFor="issues"
                  className="text-sm font-semibold"
                >
                  Probleme / Auffälligkeiten
                </label>
                <textarea
                  id="issues"
                  name="issues"
                  rows={4}
                  placeholder="Gab es Probleme, Reklamationen oder besondere Auffälligkeiten?"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="learnings"
                  className="text-sm font-semibold"
                >
                  Verbesserungen / Learnings
                </label>
                <textarea
                  id="learnings"
                  name="learnings"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Was nehmen wir für zukünftige Events mit?"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Mindestens 10 Zeichen erforderlich.
                </p>
              </div>

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