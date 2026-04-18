"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createEvent, updateEvent, type CreateEventState } from "./actions";
import { SubmitButton } from "./submit-button";

type EventFormInitialData = {
  id?: string;
  title?: string | null;
  date?: string | null;
  status?: string | null;
  company_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  notes?: string | null;
};

type Props = {
  initialData?: EventFormInitialData;
  eventId?: string;
};

const initialState: CreateEventState = {};

function fieldClass(hasError?: string) {
  return [
    "w-full rounded-lg border bg-white px-3 py-2 outline-none transition",
    hasError
      ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary)]",
  ].join(" ");
}

export function EventForm({ initialData, eventId }: Props) {
  const action = eventId ? updateEvent : createEvent;
  const [state, formAction] = useActionState(action, initialState);

  const [dismissedErrors, setDismissedErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [focusErrorKey, setFocusErrorKey] = useState(0);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setDismissedErrors({});
    setFocusErrorKey((prev) => prev + 1);
  }, [state]);

  useEffect(() => {
    if (state.errors?.title) {
      titleRef.current?.focus();
      return;
    }

    if (state.errors?.date) {
      dateRef.current?.focus();
      return;
    }

    if (state.errors?.status) {
      statusRef.current?.focus();
      return;
    }
  }, [focusErrorKey, state.errors]);

  const visibleErrors = useMemo(() => {
    return {
      title: dismissedErrors.title ? undefined : state.errors?.title,
      date: dismissedErrors.date ? undefined : state.errors?.date,
      status: dismissedErrors.status ? undefined : state.errors?.status,
      contact: dismissedErrors.contact ? undefined : state.errors?.contact,
      general: state.errors?.general,
    };
  }, [state, dismissedErrors]);

  function clearFieldError(
    fieldName: "title" | "date" | "status" | "contact"
  ) {
    setDismissedErrors((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }

  const titleValue = state.values?.title ?? initialData?.title ?? "";
  const dateValue = state.values?.date ?? initialData?.date ?? "";
  const statusValue = state.values?.status ?? initialData?.status ?? "Anfrage";
  const companyNameValue =
    state.values?.company_name ?? initialData?.company_name ?? "";
  const firstnameValue =
    state.values?.firstname ?? initialData?.firstname ?? "";
  const lastnameValue = state.values?.lastname ?? initialData?.lastname ?? "";
  const notesValue = state.values?.notes ?? initialData?.notes ?? "";

  return (
    <form
      action={formAction}
      noValidate
      className="max-w-3xl space-y-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
    >
      {eventId ? <input type="hidden" name="id" value={eventId} /> : null}

      {(state.message || visibleErrors.general) && (
        <div className="rounded-xl border border-[var(--color-danger)] bg-[rgba(192,57,43,0.08)] px-4 py-3">
          <p className="font-medium text-[var(--color-danger)]">
            {state.message ?? "Bitte prüfe die markierten Felder."}
          </p>

          {visibleErrors.general && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">
              {visibleErrors.general}
            </p>
          )}
        </div>
      )}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="section-title">Event Infos</h2>
          <p className="section-text">Die wichtigsten Grunddaten für das Event.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Titel *
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              type="text"
              defaultValue={titleValue}
              placeholder="z. B. Firmenanlass Sommer"
              aria-invalid={!!visibleErrors.title}
              aria-describedby={visibleErrors.title ? "title-error" : undefined}
              className={fieldClass(visibleErrors.title)}
              onChange={() => clearFieldError("title")}
            />
            {visibleErrors.title && (
              <p id="title-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Datum *
            </label>
            <input
              ref={dateRef}
              id="date"
              name="date"
              type="date"
              defaultValue={dateValue}
              aria-invalid={!!visibleErrors.date}
              aria-describedby={visibleErrors.date ? "date-error" : undefined}
              className={fieldClass(visibleErrors.date)}
              onChange={() => clearFieldError("date")}
            />
            {visibleErrors.date && (
              <p id="date-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status *
            </label>
            <select
              ref={statusRef}
              id="status"
              name="status"
              defaultValue={statusValue}
              aria-invalid={!!visibleErrors.status}
              aria-describedby={visibleErrors.status ? "status-error" : undefined}
              className={fieldClass(visibleErrors.status)}
              onChange={() => clearFieldError("status")}
            >
              <option value="Anfrage">Anfrage</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Bestätigt">Bestätigt</option>
              <option value="Storniert">Storniert</option>
            </select>
            {visibleErrors.status && (
              <p id="status-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.status}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="section-title">Kontakt</h2>
          <p className="section-text">Firma oder Ansprechperson für das Event.</p>
        </div>

        {visibleErrors.contact ? (
          <div className="rounded-lg border border-[var(--color-danger)] bg-[rgba(192,57,43,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {visibleErrors.contact}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="company_name" className="mb-1 block text-sm font-medium">
              Firma
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              defaultValue={companyNameValue}
              placeholder="z. B. Muster AG"
              className={fieldClass(visibleErrors.contact)}
              onChange={() => clearFieldError("contact")}
            />
          </div>

          <div>
            <label htmlFor="firstname" className="mb-1 block text-sm font-medium">
              Vorname
            </label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              defaultValue={firstnameValue}
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="lastname" className="mb-1 block text-sm font-medium">
              Nachname
            </label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              defaultValue={lastnameValue}
              className={fieldClass(visibleErrors.contact)}
              onChange={() => clearFieldError("contact")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="section-title">Notizen</h2>
          <p className="section-text">
            Erste wichtige Hinweise oder Wünsche zum Event.
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={notesValue}
            placeholder="z. B. gewünschter Ablauf, Besonderheiten, erste Infos vom Kunden"
            className={fieldClass()}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row">
        <SubmitButton />

        <Link
          href={eventId ? `/dashboard/events/${eventId}` : "/dashboard"}
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 font-medium transition hover:bg-[var(--color-surface-muted)]"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}