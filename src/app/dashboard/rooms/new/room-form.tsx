"use client";

import { useActionState } from "react";
import { createRoom, type RoomFormState } from "./actions";

export type RoomFormValues = {
  name?: string;
  capacity?: string;
  function_description?: string;
  status?: string;
  equipment?: string;
  internal_notes?: string;
};

type RoomFormProps = {
  action?: (
    state: RoomFormState,
    formData: FormData
  ) => Promise<RoomFormState>;
  submitLabel?: string;
  pendingLabel?: string;
  initialValues?: RoomFormValues;
  mode?: "create" | "edit";
};

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

export function RoomForm({
  action = createRoom,
  submitLabel = "Raum erstellen",
  pendingLabel = "Raum wird erstellt...",
  initialValues = {},
  mode = "create",
}: RoomFormProps) {
  const [state, dispatch, pending] = useActionState(action, initialState);

  const values = {
    ...initialValues,
    ...state.values,
  };

  return (
  <div className="space-y-6">
    <form action={dispatch} className="space-y-6">
      {state.errors?.general ? (
        <div className="rounded-xl border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.errors.general}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
            <h2 className="section-title">Basisdaten</h2>
            <p className="section-text">
                Grundinformationen zum Raum, zur Kapazität und zur Nutzung.
            </p>
            </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Name des Raums</span>
            <input
              name="name"
              defaultValue={values.name ?? ""}
              className={fieldClass(state.errors?.name)}
            />
            {state.errors?.name ? (
              <p className="text-sm text-[var(--color-danger)]">
                {state.errors.name}
              </p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Kapazität</span>
            <input
              name="capacity"
              type="number"
              min="0"
              defaultValue={values.capacity ?? ""}
              className={fieldClass(state.errors?.capacity)}
            />
            {state.errors?.capacity ? (
              <p className="text-sm text-[var(--color-danger)]">
                {state.errors.capacity}
              </p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select
              name="status"
              defaultValue={values.status ?? "active"}
              className={fieldClass(state.errors?.status)}
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="blocked">Gesperrt</option>
            </select>
            {state.errors?.status ? (
              <p className="text-sm text-[var(--color-danger)]">
                {state.errors.status}
              </p>
            ) : null}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Funktion / Nutzung</span>
            <textarea
              name="function_description"
              rows={4}
              defaultValue={values.function_description ?? ""}
              className={fieldClass()}
              placeholder="z. B. Seminare, Bankette, Sitzungen, Apéros ..."
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Ausstattung</span>
            <input
              name="equipment"
              defaultValue={values.equipment ?? ""}
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
              defaultValue={values.internal_notes ?? ""}
              className={fieldClass()}
              placeholder="Nur intern sichtbar"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Bilder</h2>
          <p className="section-text">
            Bilder für Darstellung und interne Planung.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <input
            type="file"
            name="images"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
          />

          {state.errors?.images ? (
            <p className="text-sm text-[var(--color-danger)]">
              {state.errors.images}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Erlaubt sind JPG, PNG, WEBP und GIF bis 5 MB pro Bild.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
            {mode === "edit"
                ? "Änderungen werden direkt beim Raum gespeichert."
                : "Nach dem Speichern erscheint der Raum in der Raumverwaltung."}
            </p>

        <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:shadow-none"
        >
            {pending ? pendingLabel : submitLabel}
        </button>
            </div>
              </form>
            </div>
          );
        }