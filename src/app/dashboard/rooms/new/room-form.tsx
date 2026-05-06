"use client";

import { useActionState } from "react";
import { createRoom, type RoomFormState } from "./actions";

const initialState: RoomFormState = {
  message: "",
  errors: {},
  values: {},
};

function fieldClass(error?: string) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition",
    error
      ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
  ].join(" ");
}

export function RoomForm() {
  const [state, dispatch, pending] = useActionState(createRoom, initialState);

  return (
    <form action={dispatch} className="space-y-6">
      {state.errors?.general ? (
        <div className="rounded-xl border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.errors.general}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Basisdaten</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Name des Raums *</span>
            <input
              name="name"
              defaultValue={state.values?.name ?? ""}
              className={fieldClass(state.errors?.name)}
            />
            {state.errors?.name ? (
              <p className="text-sm text-[var(--color-danger)]">{state.errors.name}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Kapazität</span>
            <input
              name="capacity"
              type="number"
              min="0"
              defaultValue={state.values?.capacity ?? ""}
              className={fieldClass(state.errors?.capacity)}
            />
            {state.errors?.capacity ? (
              <p className="text-sm text-[var(--color-danger)]">{state.errors.capacity}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Status *</span>
            <select
              name="status"
              defaultValue={state.values?.status ?? "active"}
              className={fieldClass(state.errors?.status)}
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="blocked">Gesperrt</option>
            </select>
            {state.errors?.status ? (
              <p className="text-sm text-[var(--color-danger)]">{state.errors.status}</p>
            ) : null}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Funktion / Nutzung</span>
            <textarea
              name="function_description"
              rows={4}
              defaultValue={state.values?.function_description ?? ""}
              className={fieldClass()}
              placeholder="z. B. Seminare, Bankette, Sitzungen, Apéros ..."
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Ausstattung</span>
            <input
              name="equipment"
              defaultValue={state.values?.equipment ?? ""}
              className={fieldClass()}
              placeholder="Beamer, WLAN, Mikrofon, Bühne ..."
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Mehrere Einträge mit Komma trennen.
            </p>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Interne Notizen</span>
            <textarea
              name="internal_notes"
              rows={4}
              defaultValue={state.values?.internal_notes ?? ""}
              className={fieldClass()}
              placeholder="Nur intern sichtbar"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:shadow-none"
        >
          {pending ? "Raum wird erstellt..." : "Raum erstellen"}
        </button>
      </div>
    </form>
  );
}