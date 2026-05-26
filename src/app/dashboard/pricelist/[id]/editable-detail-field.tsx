"use client";

import { useState, useTransition } from "react";

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

function SuccessBadge({ message }: { message?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
      {message ?? "Gespeichert"}
    </span>
  );
}

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
  const [state, setState] = useState<EditableFieldState>({ success: false });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await formAction({ success: false }, formData);
      setState(result);

      if (result.success) {
        setIsEditing(false);
      }
    });
  }

  if (!canEdit) {
    return <span>{value}</span>;
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <span>{value}</span>

        <button
          type="button"
          onClick={() => {
            setState({ success: false });
            setIsEditing(true);
          }}
          className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-medium leading-5 transition hover:bg-[var(--color-surface-muted)]"
        >
          Bearbeiten
        </button>

        {state.success ? <SuccessBadge message={state.message} /> : null}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex w-full flex-wrap items-center gap-2">
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
        disabled={isPending}
        className="inline-save-button inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition disabled:opacity-60"
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
  const [state, setState] = useState<EditableFieldState>({ success: false });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await formAction({ success: false }, formData);
      setState(result);

      if (result.success) {
        setIsEditing(false);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="section-title">Beschreibung</h2>

        {canEdit ? (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setState({ success: false });
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-2 py-px text-xs font-medium leading-4 transition hover:bg-[var(--color-surface-muted)]"
              >
                Bearbeiten
              </button>
            ) : null}

            {state.success ? <SuccessBadge message={state.message} /> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {isEditing ? (
          <form action={handleSubmit} className="flex w-full flex-wrap items-center gap-2">
            <textarea
              name="description"
              defaultValue={initialValue}
              rows={4}
              className="min-h-28 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              autoFocus
            />

            <button
              type="submit"
              disabled={isPending}
              className="inline-save-button inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition disabled:opacity-60"
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
type StatusToggleProps = {
  initialValue: boolean;
  formAction: EditableFieldAction;
  canEdit: boolean;
};

export function StatusToggle({
  initialValue,
  formAction,
  canEdit,
}: StatusToggleProps) {
  const [isActive, setIsActive] = useState(initialValue);
  const [state, setState] = useState<EditableFieldState>({ success: false });
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: boolean) {
    setIsActive(nextValue);
    setState({ success: false });

    const formData = new FormData();
    formData.set("is_active", String(nextValue));

    startTransition(async () => {
      const result = await formAction({ success: false }, formData);
      setState(result);

      if (!result.success) {
        setIsActive(initialValue);
      }
    });
  }

  if (!canEdit) {
    return (
      <span className={isActive ? "status-badge status-badge--active" : "status-badge status-badge--inactive"}>
        {isActive ? "Aktiv" : "Inaktiv"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={isPending}
        onClick={() => handleChange(!isActive)}
        className={[
          "relative inline-flex h-5 w-9 items-center rounded-full border transition disabled:opacity-60",
          isActive
            ? "border-green-200 bg-green-100"
            : "border-red-200 bg-red-100",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition",
            isActive ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>

      <span className={isActive ? "status-badge status-badge--active" : "status-badge status-badge--inactive"}>
        {isActive ? "Aktiv" : "Inaktiv"}
      </span>

      {state.success ? <SuccessBadge message={state.message} /> : null}

      {state.message && !state.success ? (
        <p className="basis-full text-xs text-red-600">{state.message}</p>
      ) : null}
    </div>
  );
}