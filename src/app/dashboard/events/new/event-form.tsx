"use client";

import { useActionState, useMemo, useState } from "react";
import { createEvent, type CreateEventState } from "./actions";
import { SubmitButton } from "./submit-button";

type EventFormInitialData = {
  id?: string;
  title?: string | null;
  date?: string | null;
  status?: string | null;
  company_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  email?: string | null;
  adults?: number | null;
  children?: number | null;
  address?: string | null;
  room?: string | null;
  tech?: string | null;
  infrastructure?: string | null;
  schedule?: string | null;
  food?: string | null;
  drinks?: string | null;
  payment_type?: string | null;
  billing_company_name?: string | null;
  billing_firstname?: string | null;
  billing_lastname?: string | null;
  billing_address?: string | null;
  billing_phone?: string | null;
  billing_email?: string | null;
  notes?: string | null;
};

type EventFormProps = {
  mode?: "create" | "edit";
  submitLabel?: string;
  initialData?: EventFormInitialData;
  action?: (
    state: CreateEventState,
    formData: FormData
  ) => Promise<CreateEventState>;
};

const initialState: CreateEventState = {
  message: "",
  errors: {},
  values: {},
};

const statusOptions = [
  { value: "Anfrage", label: "Anfrage" },
  { value: "In Bearbeitung", label: "In Bearbeitung" },
  { value: "Bestätigt", label: "Bestätigt" },
  { value: "Storniert", label: "Storniert" },
] as const;

const ROOM_OPTIONS = [
  { value: "", label: "Kein Raum" },
  { value: "irgendwo", label: "Irgendwo" },
  { value: "restaurant", label: "Restaurant" },
  { value: "saal", label: "Saal" },
  { value: "seminarraum", label: "Seminarraum" },
  { value: "sitzungszimmer", label: "Sitzungszimmer" },
  { value: "terrasse", label: "Terrasse" },
] as const;

const PAYMENT_TYPE_OPTIONS = [
  { value: "", label: "Keine Auswahl" },
  { value: "barzahlung", label: "Barzahlung" },
  { value: "rechnung", label: "Rechnung" },
  { value: "intern_bewohnende", label: "Intern Bewohnende" },
  { value: "intern_aktivierung", label: "Intern Aktivierung" },
  { value: "intern_mitarbeiter", label: "Intern Mitarbeiter" },
  { value: "intern_gl", label: "Intern GL" },
  { value: "intern_vr", label: "Intern VR" },
] as const;

const EVENT_CREATE_LEAD_TIME_DAYS = 7; // Sperrzeit

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("de-CH");
}

function getMinimumCreateEventDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + EVENT_CREATE_LEAD_TIME_DAYS - 1);

  return formatDateInputValue(date);
}

function fieldClass(error?: string) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition",
    error
      ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
  ].join(" ");
}

export function EventForm({
  mode = "create",
  submitLabel,
  initialData,
  action,
}: EventFormProps) {
  const formAction = action ?? createEvent;
  const [state, dispatch] = useActionState(formAction, initialState);
  const [dismissedErrors, setDismissedErrors] = useState<Record<string, boolean>>(
    {}
  );

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const visibleErrors = useMemo(() => {
    return {
      title: dismissedErrors.title ? undefined : state.errors?.title,
      date:
        clientErrors.date ??
        (dismissedErrors.date ? undefined : state.errors?.date),
      status: dismissedErrors.status ? undefined : state.errors?.status,
      contact: dismissedErrors.contact ? undefined : state.errors?.contact,
      email: dismissedErrors.email ? undefined : state.errors?.email,
      adults: dismissedErrors.adults ? undefined : state.errors?.adults,
      children: dismissedErrors.children ? undefined : state.errors?.children,
      room: dismissedErrors.room ? undefined : state.errors?.room,
      payment_type: dismissedErrors.payment_type ? undefined : state.errors?.payment_type,
      billing_contact: dismissedErrors.billing_contact ? undefined : state.errors?.billing_contact,
      billing_email: dismissedErrors.billing_email ? undefined : state.errors?.billing_email,
      general: state.errors?.general,
    };
  }, [state, dismissedErrors, clientErrors]);

 const initialPaymentType =
  state.values?.payment_type ?? initialData?.payment_type ?? "";

const initialHasBillingAddress =
  initialPaymentType === "rechnung" &&
  !!(
    state.values?.billing_company_name ??
    initialData?.billing_company_name ??
    state.values?.billing_firstname ??
    initialData?.billing_firstname ??
    state.values?.billing_lastname ??
    initialData?.billing_lastname ??
    state.values?.billing_address ??
    initialData?.billing_address ??
    state.values?.billing_email ??
    initialData?.billing_email ??
    state.values?.billing_phone ??
    initialData?.billing_phone
  );

const [selectedPaymentType, setSelectedPaymentType] =
  useState(initialPaymentType);

const [hasBillingAddress, setHasBillingAddress] =
  useState(initialHasBillingAddress); 

  function clearFieldError(
    fieldName:
      | "title"
      | "date"
      | "status"
      | "contact"
      | "email"
      | "adults"
      | "children"
      | "room"
      | "payment_type"
      | "billing_contact"
      | "billing_email"
  ) {
    setDismissedErrors((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }

  function validateDateInRealtime(value: string) {
  if (mode !== "create") return;

  if (!value) {
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next.date;
      return next;
    });
    clearFieldError("date");
    return;
  }

  const minimumDate = getMinimumCreateEventDate();

  if (value < minimumDate) {
    setClientErrors((prev) => ({
      ...prev,
      date: `Erster möglicher Termin um einen Event zu erstellen: ${formatDisplayDate(minimumDate)}.`,
    }));
    return;
  }

  setClientErrors((prev) => {
    const next = { ...prev };
    delete next.date;
    return next;
  });

  clearFieldError("date");
}

  function handleFormAction(formData: FormData) {
    setDismissedErrors({});
    setClientErrors({});
    dispatch(formData);
  }

  const titleValue = state.values?.title ?? initialData?.title ?? "";
  const dateValue = state.values?.date ?? initialData?.date ?? "";
  const statusValue = state.values?.status ?? initialData?.status ?? "Anfrage";
  const companyValue =
    state.values?.company_name ?? initialData?.company_name ?? "";
  const firstnameValue =
    state.values?.firstname ?? initialData?.firstname ?? "";
  const lastnameValue = state.values?.lastname ?? initialData?.lastname ?? "";
  const phoneValue = state.values?.phone ?? initialData?.phone ?? "";
  const emailValue = state.values?.email ?? initialData?.email ?? "";
  const adultsValue =
    state.values?.adults ??
    (initialData?.adults != null ? String(initialData.adults) : "");
  const childrenValue =
    state.values?.children ??
    (initialData?.children != null ? String(initialData.children) : "");
  const addressValue = state.values?.address ?? initialData?.address ?? "";
  const roomValue = state.values?.room ?? initialData?.room ?? "";
  const techValue = state.values?.tech ?? initialData?.tech ?? "";
  const infrastructureValue =
    state.values?.infrastructure ?? initialData?.infrastructure ?? "";
  const scheduleValue = state.values?.schedule ?? initialData?.schedule ?? "";
  const foodValue = state.values?.food ?? initialData?.food ?? "";
  const drinksValue = state.values?.drinks ?? initialData?.drinks ?? "";
  const paymentTypeValue =
    state.values?.payment_type ?? initialData?.payment_type ?? "";
  const notesValue = state.values?.notes ?? initialData?.notes ?? "";
  const billingCompanyValue =
    state.values?.billing_company_name ?? initialData?.billing_company_name ?? "";
  const billingFirstnameValue =
    state.values?.billing_firstname ?? initialData?.billing_firstname ?? "";
  const billingLastnameValue =
    state.values?.billing_lastname ?? initialData?.billing_lastname ?? "";
  const billingAddressValue =
    state.values?.billing_address ?? initialData?.billing_address ?? "";
  const billingPhoneValue =
    state.values?.billing_phone ?? initialData?.billing_phone ?? "";
  const billingEmailValue =
    state.values?.billing_email ?? initialData?.billing_email ?? "";

  return (
    <form action={handleFormAction} className="space-y-6" noValidate>
      {mode === "edit" && initialData?.id ? (
        <input type="hidden" name="id" value={initialData.id} />
      ) : null}

      {state.message && !state.errors?.general ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-muted)]">
          {state.message}
        </div>
      ) : null}

      {state.errors?.general ? (
        <div className="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.errors.general}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Eventdaten</h2>
          <p className="section-text">
            Basisinformationen zum Event und aktueller Bearbeitungsstatus.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Titel
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={titleValue}
              placeholder="z. B. Firmenanlass Müller AG"
              aria-invalid={!!visibleErrors.title}
              aria-describedby={visibleErrors.title ? "title-error" : undefined}
              className={fieldClass(visibleErrors.title)}
              onChange={() => clearFieldError("title")}
            />
            {visibleErrors.title ? (
              <p id="title-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.title}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Datum
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={dateValue}
              aria-invalid={!!visibleErrors.date}
              aria-describedby={visibleErrors.date ? "date-error" : undefined}
              className={fieldClass(visibleErrors.date)}
              onChange={(event) => validateDateInRealtime(event.target.value)}
            />
            {visibleErrors.date ? (
              <p id="date-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.date}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusValue}
              aria-invalid={!!visibleErrors.status}
              aria-describedby={visibleErrors.status ? "status-error" : undefined}
              className={fieldClass(visibleErrors.status)}
              onChange={() => clearFieldError("status")}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {visibleErrors.status ? (
              <p id="status-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.status}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Auftraggeber / Kontakt</h2>
          <p className="section-text">
            Kontaktperson, Firma und Rechnungs- oder Korrespondenzadresse.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="company_name" className="mb-1 block text-sm font-medium">
              Firma
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              defaultValue={companyValue}
              placeholder="z. B. Muster AG"
              aria-invalid={!!visibleErrors.contact}
              aria-describedby={visibleErrors.contact ? "contact-error" : undefined}
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
              placeholder="z. B. Max"
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
              placeholder="z. B. Muster"
              aria-invalid={!!visibleErrors.contact}
              aria-describedby={visibleErrors.contact ? "contact-error" : undefined}
              className={fieldClass(visibleErrors.contact)}
              onChange={() => clearFieldError("contact")}
            />
            {visibleErrors.contact ? (
              <p id="contact-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.contact}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Telefon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={phoneValue}
              placeholder="z. B. +41 79 123 45 67"
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={emailValue}
              placeholder="z. B. kontakt@muster.ch"
              aria-invalid={!!visibleErrors.email}
              aria-describedby={visibleErrors.email ? "email-error" : undefined}
              className={fieldClass(visibleErrors.email)}
              onChange={() => clearFieldError("email")}
            />
            {visibleErrors.email ? (
              <p id="email-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.email}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              Adresse
            </label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={addressValue}
              placeholder="z. B. Bahnhofstrasse 10, 8001 Zürich"
              className={fieldClass()}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Personen & Raum</h2>
          <p className="section-text">
            Gästeanzahl und vorgesehener Raum für die Durchführung.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="adults" className="mb-1 block text-sm font-medium">
              Erwachsene
            </label>
            <input
              id="adults"
              name="adults"
              type="number"
              min="0"
              step="1"
              defaultValue={adultsValue}
              placeholder="z. B. 40"
              aria-invalid={!!visibleErrors.adults}
              aria-describedby={visibleErrors.adults ? "adults-error" : undefined}
              className={fieldClass(visibleErrors.adults)}
              onChange={() => clearFieldError("adults")}
            />
            {visibleErrors.adults ? (
              <p id="adults-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.adults}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="children" className="mb-1 block text-sm font-medium">
              Kinder
            </label>
            <input
              id="children"
              name="children"
              type="number"
              min="0"
              step="1"
              defaultValue={childrenValue}
              placeholder="z. B. 8"
              aria-invalid={!!visibleErrors.children}
              aria-describedby={visibleErrors.children ? "children-error" : undefined}
              className={fieldClass(visibleErrors.children)}
              onChange={() => clearFieldError("children")}
            />
            {visibleErrors.children ? (
              <p id="children-error" className="mt-1 text-sm text-[var(--color-danger)]">
                {visibleErrors.children}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {ROOM_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition",
                visibleErrors.room
                  ? "border-[var(--color-danger)]"
                  : "border-[var(--color-border)]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="room"
                value={option.value}
                defaultChecked={(roomValue || "") === option.value}
                onChange={() => clearFieldError("room")}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>

        {visibleErrors.room ? (
          <p className="mt-3 text-sm text-[var(--color-danger)]">
            {visibleErrors.room}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Organisation & Ablauf</h2>
          <p className="section-text">
            Angaben zu Technik, Infrastruktur und geplantem Ablauf.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label htmlFor="tech" className="mb-1 block text-sm font-medium">
              Technik
            </label>
            <textarea
              id="tech"
              name="tech"
              rows={4}
              defaultValue={techValue}
              placeholder="z. B. Mikrofon, Beamer, Leinwand, Musikanlage"
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="infrastructure" className="mb-1 block text-sm font-medium">
              Infrastruktur
            </label>
            <textarea
              id="infrastructure"
              name="infrastructure"
              rows={4}
              defaultValue={infrastructureValue}
              placeholder="z. B. Bühne, Podest, Stehtische, Garderobe"
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="schedule" className="mb-1 block text-sm font-medium">
              Ablauf / Zeitplan
            </label>
            <textarea
              id="schedule"
              name="schedule"
              rows={5}
              defaultValue={scheduleValue}
              placeholder="z. B. 18:00 Apéro, 19:00 Essen, 21:00 Präsentation"
              className={fieldClass()}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Verpflegung & Abrechnung</h2>
          <p className="section-text">
            Angaben zu Essen, Getränken und geplanter Zahlungsart.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label htmlFor="food" className="mb-1 block text-sm font-medium">
              Essen
            </label>
            <textarea
              id="food"
              name="food"
              rows={4}
              defaultValue={foodValue}
              placeholder="z. B. Apéro, Menü, vegetarische Optionen"
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="drinks" className="mb-1 block text-sm font-medium">
              Getränke
            </label>
            <textarea
              id="drinks"
              name="drinks"
              rows={4}
              defaultValue={drinksValue}
              placeholder="z. B. Mineral, Wein, Kaffee, Apéro-Getränke"
              className={fieldClass()}
            />
          </div>

          <div>
            <label htmlFor="payment_type" className="mb-1 block text-sm font-medium">
              Zahlungsart
            </label>
            <select
              id="payment_type"
              name="payment_type"
              defaultValue={paymentTypeValue}
              aria-invalid={!!visibleErrors.payment_type}
              aria-describedby={
                visibleErrors.payment_type ? "payment-type-error" : undefined
              }
              className={fieldClass(visibleErrors.payment_type)}
              onChange={(event) => {
                clearFieldError("payment_type");
                setSelectedPaymentType(event.target.value);

                if (event.target.value !== "rechnung") {
                  setHasBillingAddress(false);
                }
              }}
            >
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {visibleErrors.payment_type ? (
              <p
                id="payment-type-error"
                className="mt-1 text-sm text-[var(--color-danger)]"
              >
                {visibleErrors.payment_type}
              </p>
            ) : null}
          </div>
          {selectedPaymentType === "rechnung" ? (
            <div className="md:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={hasBillingAddress}
                  onChange={(event) => setHasBillingAddress(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Abweichende Rechnungsadresse erfassen
                  </span>
                  <span className="block text-sm text-[var(--color-text-muted)]">
                    Nur ausfüllen, wenn die Rechnung nicht an den Auftraggeber geht.
                  </span>
                </span>
              </label>

              {hasBillingAddress ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    name="billing_company_name"
                    defaultValue={billingCompanyValue}
                    placeholder="Firma"
                    className={fieldClass()}
                  />

                  <input
                    name="billing_firstname"
                    defaultValue={billingFirstnameValue}
                    placeholder="Vorname"
                    className={fieldClass()}
                  />

                  <input
                    name="billing_lastname"
                    defaultValue={billingLastnameValue}
                    placeholder="Nachname"
                    className={fieldClass()}
                  />

                  <input
                    name="billing_email"
                    type="email"
                    defaultValue={billingEmailValue}
                    placeholder="E-Mail"
                    className={fieldClass()}
                  />

                  <input
                    name="billing_phone"
                    defaultValue={billingPhoneValue}
                    placeholder="Telefon"
                    className={fieldClass()}
                  />

                  <input
                    name="billing_address"
                    defaultValue={billingAddressValue}
                    placeholder="Adresse"
                    className={`md:col-span-2 ${fieldClass()}`}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Interne Notizen</h2>
          <p className="section-text">
            Zusätzliche interne Hinweise, Sonderwünsche oder Absprachen.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notizen
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={6}
            defaultValue={notesValue}
            placeholder="Besondere Wünsche, interne Hinweise, Absprachen..."
            className={fieldClass()}
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          {mode === "edit"
            ? "Änderungen werden direkt beim Event gespeichert."
            : "Nach dem Speichern erscheint das Event im Dashboard."}
        </p>

        <SubmitButton
          label={
            submitLabel ??
            (mode === "edit" ? "Änderungen speichern" : "Event erstellen")
          }
          pendingLabel={
            mode === "edit" ? "Speichert Änderungen..." : "Erstellt Event..."
          }
        />
      </div>
    </form>
  );
}