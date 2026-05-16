"use client";

import { useState } from "react";
import { useActionState } from "react";

type EditableFieldState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

type EditableFieldAction = (
  prevState: EditableFieldState,
  formData: FormData
) => Promise<EditableFieldState>;

type Props = {
  value: React.ReactNode;
  name: string;
  initialValue: string | number;
  formAction: EditableFieldAction;
  canEdit: boolean;
  type?: "text" | "number" | "textarea";
  inputMode?: "text" | "decimal" | "numeric";
};

export function EditableDetailField({
  value,
  name,
  initialValue,
  formAction,
  canEdit,
  type = "text",
  inputMode = "text",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [state, action] = useActionState(formAction, {
    success: false,
  });

  if (!canEdit) {
    return <span>{value}</span>;
  }

  if (!isEditing) {
    if (type === "textarea") {
      return (
        <div className="space-y-3">
          <div>{value}</div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-medium leading-5 transition hover:bg-[var(--color-surface-muted)]"
          >
            Bearbeiten
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <span>{value}</span>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-medium leading-5 transition hover:bg-[var(--color-surface-muted)]"
        >
          Bearbeiten
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-wrap items-center gap-2">
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={String(initialValue)}
          rows={4}
          className="min-h-28 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
          autoFocus
        />
      ) : (
        <input
          name={name}
          defaultValue={initialValue}
          type={type}
          inputMode={inputMode}
          className="w-32 rounded-md border border-[var(--color-border)] px-2 py-1 text-sm"
          autoFocus
        />
      )}

      <button
        type="submit"
        className="inline-save-button inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition"
        >
        Speichern
        </button>

      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
        Abbrechen
        </button>

      {state.errors?.[name] ? (
        <p className="basis-full text-xs text-red-600">{state.errors[name]}</p>
      ) : null}

      {state.message && !state.success ? (
        <p className="basis-full text-xs text-red-600">{state.message}</p>
      ) : null}
      {state.success ? (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            {state.message ?? "Gespeichert"}
        </span>
) : null}
    </form>
  );
}

type EditableDescriptionSectionProps = {
  initialValue: string;
  formAction: EditableFieldAction;
  canEdit: boolean;
};

export function EditableDescriptionSection({
  initialValue,
  formAction,
  canEdit,
}: EditableDescriptionSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [state, action] = useActionState(formAction, {
    success: false,
  });

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="section-title">Beschreibung</h2>

        {canEdit && !isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-medium leading-5 transition hover:bg-[var(--color-surface-muted)]"
          >
            Bearbeiten
          </button>
        ) : null}
      </div>

      <div className="mt-6">
        {isEditing ? (
          <form action={action} className="flex w-full flex-wrap items-center gap-2">
            <textarea
              name="description"
              defaultValue={initialValue}
              rows={4}
              className="min-h-28 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              autoFocus
            />

            <button
              type="submit"
              className="inline-save-button inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition"
            >
              Speichern
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
            >
              Abbrechen
            </button>

            {state.errors?.description ? (
              <p className="basis-full text-xs text-red-600">
                {state.errors.description}
              </p>
            ) : null}

            {state.message && !state.success ? (
              <p className="basis-full text-xs text-red-600">{state.message}</p>
            ) : null}

            {state.success ? (
              <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {state.message ?? "Gespeichert"}
              </span>
            ) : null}
          </form>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-6">
            {initialValue || "Keine Beschreibung erfasst."}
          </p>
        )}
      </div>
    </section>
  );
}