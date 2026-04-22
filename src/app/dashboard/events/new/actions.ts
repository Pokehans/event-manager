"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateEventState = {
  message?: string;
  errors?: {
    title?: string;
    date?: string;
    status?: string;
    contact?: string;
    email?: string;
    adults?: string;
    children?: string;
    room?: string;
    payment_type?: string;
    general?: string;
  };
  values?: {
    title?: string;
    date?: string;
    status?: string;
    company_name?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
    adults?: string;
    children?: string;
    address?: string;
    room?: string;
    tech?: string;
    infrastructure?: string;
    schedule?: string;
    food?: string;
    drinks?: string;
    payment_type?: string;
    notes?: string;
  };
};

const allowedStatuses = [
  "Anfrage",
  "In Bearbeitung",
  "Bestätigt",
  "Storniert",
] as const;

const allowedRooms = [
  "irgendwo",
  "restaurant",
  "saal",
  "seminarraum",
  "sitzungszimmer",
  "terrasse",
] as const;

const allowedPaymentTypes = [
  "barzahlung",
  "rechnung",
  "intern_bewohnende",
  "intern_aktivierung",
  "intern_mitarbeiter",
  "intern_gl",
  "intern_vr",
] as const;

type EventFormValues = {
  title: string;
  date: string;
  status: string;
  company_name: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  adults: string;
  children: string;
  address: string;
  room: string;
  tech: string;
  infrastructure: string;
  schedule: string;
  food: string;
  drinks: string;
  payment_type: string;
  notes: string;
};

type ExistingEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
  company_name: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  email: string | null;
  adults: number | null;
  children: number | null;
  address: string | null;
  room: string | null;
  tech: string | null;
  infrastructure: string | null;
  schedule: string | null;
  food: string | null;
  drinks: string | null;
  payment_type: string | null;
  notes: string | null;
};

function getFormValues(formData: FormData): EventFormValues {
  return {
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    status: String(formData.get("status") ?? "Anfrage").trim(),
    company_name: String(formData.get("company_name") ?? "").trim(),
    firstname: String(formData.get("firstname") ?? "").trim(),
    lastname: String(formData.get("lastname") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    adults: String(formData.get("adults") ?? "").trim(),
    children: String(formData.get("children") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    room: String(formData.get("room") ?? "").trim(),
    tech: String(formData.get("tech") ?? "").trim(),
    infrastructure: String(formData.get("infrastructure") ?? "").trim(),
    schedule: String(formData.get("schedule") ?? "").trim(),
    food: String(formData.get("food") ?? "").trim(),
    drinks: String(formData.get("drinks") ?? "").trim(),
    payment_type: String(formData.get("payment_type") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function parseOptionalInteger(value: string) {
  if (!value) return null;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return NaN;
  }

  return parsed;
}

function normalizeOptionalString(value: string) {
  return value.trim() ? value.trim() : null;
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "anfrage":
    case "Anfrage":
      return "Anfrage";
    case "bearbeitung":
    case "In Bearbeitung":
      return "In Bearbeitung";
    case "bestaetigt":
    case "Bestätigt":
      return "Bestätigt";
    case "storniert":
    case "Storniert":
      return "Storniert";
    case "archiviert":
    case "Archiviert":
      return "Archiviert";
    default:
      return status || null;
  }
}

function getRoomLabel(room: string | null) {
  switch (room) {
    case "irgendwo":
      return "Irgendwo";
    case "restaurant":
      return "Restaurant";
    case "saal":
      return "Saal";
    case "seminarraum":
      return "Seminarraum";
    case "sitzungszimmer":
      return "Sitzungszimmer";
    case "terrasse":
      return "Terrasse";
    default:
      return room || null;
  }
}

function getPaymentTypeLabel(paymentType: string | null) {
  switch (paymentType) {
    case "barzahlung":
      return "Barzahlung";
    case "rechnung":
      return "Rechnung";
    case "intern_bewohnende":
      return "Intern Bewohnende";
    case "intern_aktivierung":
      return "Intern Aktivierung";
    case "intern_mitarbeiter":
      return "Intern Mitarbeiter";
    case "intern_gl":
      return "Intern GL";
    case "intern_vr":
      return "Intern VR";
    default:
      return paymentType || null;
  }
}

function formatChangeText(
  label: string,
  oldValue: string | number | null,
  newValue: string | number | null
) {
  const oldDisplay =
    oldValue === null || oldValue === "" ? null : String(oldValue);
  const newDisplay =
    newValue === null || newValue === "" ? null : String(newValue);

  if (oldDisplay === newDisplay) {
    return null;
  }

  if (newDisplay) {
    return `${label} geändert Neu: ${newDisplay}`;
  }

  if (oldDisplay) {
    return `${label} entfernt`;
  }

  return null;
}

function validateEventValues(values: EventFormValues) {
  const errors: CreateEventState["errors"] = {};

  if (!values.title) {
    errors.title = "Bitte einen Titel eingeben.";
  }

  if (!values.date) {
    errors.date = "Bitte ein Datum wählen.";
  }

  if (!values.status) {
    errors.status = "Bitte einen Status wählen.";
  } else if (
    !allowedStatuses.includes(values.status as (typeof allowedStatuses)[number])
  ) {
    errors.status = "Ungültiger Status.";
  }

  if (!values.company_name && !values.lastname) {
    errors.contact = "Bitte mindestens Firma oder Nachname angeben.";
  }

  if (values.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(values.email)) {
      errors.email = "Bitte eine gültige E-Mail-Adresse eingeben.";
    }
  }

  if (values.adults) {
    const parsedAdults = parseOptionalInteger(values.adults);
    if (Number.isNaN(parsedAdults)) {
      errors.adults = "Bitte eine ganze Zahl ab 0 eingeben.";
    }
  }

  if (values.children) {
    const parsedChildren = parseOptionalInteger(values.children);
    if (Number.isNaN(parsedChildren)) {
      errors.children = "Bitte eine ganze Zahl ab 0 eingeben.";
    }
  }

  if (values.room) {
    if (!allowedRooms.includes(values.room as (typeof allowedRooms)[number])) {
      errors.room = "Ungültiger Raum.";
    }
  }

  if (values.payment_type) {
    if (
      !allowedPaymentTypes.includes(
        values.payment_type as (typeof allowedPaymentTypes)[number]
      )
    ) {
      errors.payment_type = "Ungültige Zahlungsart.";
    }
  }

  return errors;
}

function buildChangeLog(existingEvent: ExistingEvent, values: EventFormValues) {
  const changes: string[] = [];

  const nextAdults = parseOptionalInteger(values.adults);
  const nextChildren = parseOptionalInteger(values.children);

  const nextEvent: Omit<ExistingEvent, "id"> = {
    title: values.title,
    date: values.date,
    status: values.status,
    company_name: normalizeOptionalString(values.company_name),
    firstname: normalizeOptionalString(values.firstname),
    lastname: normalizeOptionalString(values.lastname),
    phone: normalizeOptionalString(values.phone),
    email: normalizeOptionalString(values.email),
    adults: nextAdults,
    children: nextChildren,
    address: normalizeOptionalString(values.address),
    room: normalizeOptionalString(values.room),
    tech: normalizeOptionalString(values.tech),
    infrastructure: normalizeOptionalString(values.infrastructure),
    schedule: normalizeOptionalString(values.schedule),
    food: normalizeOptionalString(values.food),
    drinks: normalizeOptionalString(values.drinks),
    payment_type: normalizeOptionalString(values.payment_type),
    notes: normalizeOptionalString(values.notes),
  };

  const titleChange = formatChangeText(
    "Titel",
    existingEvent.title,
    nextEvent.title
  );
  if (titleChange) changes.push(titleChange);

  const dateChange = formatChangeText("Datum", existingEvent.date, nextEvent.date);
  if (dateChange) changes.push(dateChange);

  const statusChange = formatChangeText(
    "Status",
    getStatusLabel(existingEvent.status),
    getStatusLabel(nextEvent.status)
  );
  if (statusChange) changes.push(statusChange);

  const companyChange = formatChangeText(
    "Firma",
    existingEvent.company_name,
    nextEvent.company_name
  );
  if (companyChange) changes.push(companyChange);

  const firstnameChange = formatChangeText(
    "Vorname",
    existingEvent.firstname,
    nextEvent.firstname
  );
  if (firstnameChange) changes.push(firstnameChange);

  const lastnameChange = formatChangeText(
    "Nachname",
    existingEvent.lastname,
    nextEvent.lastname
  );
  if (lastnameChange) changes.push(lastnameChange);

  const phoneChange = formatChangeText(
    "Telefon",
    existingEvent.phone,
    nextEvent.phone
  );
  if (phoneChange) changes.push(phoneChange);

  const emailChange = formatChangeText(
    "E-Mail",
    existingEvent.email,
    nextEvent.email
  );
  if (emailChange) changes.push(emailChange);

  const adultsChange = formatChangeText(
    "Erwachsene",
    existingEvent.adults,
    nextEvent.adults
  );
  if (adultsChange) changes.push(adultsChange);

  const childrenChange = formatChangeText(
    "Kinder",
    existingEvent.children,
    nextEvent.children
  );
  if (childrenChange) changes.push(childrenChange);

  const addressChange = formatChangeText(
    "Adresse",
    existingEvent.address,
    nextEvent.address
  );
  if (addressChange) changes.push(addressChange);

  const roomChange = formatChangeText(
    "Raum",
    getRoomLabel(existingEvent.room),
    getRoomLabel(nextEvent.room)
  );
  if (roomChange) changes.push(roomChange);

  if (existingEvent.tech !== nextEvent.tech) {
    changes.push("Technik geändert");
  }

  if (existingEvent.infrastructure !== nextEvent.infrastructure) {
    changes.push("Infrastruktur geändert");
  }

  if (existingEvent.schedule !== nextEvent.schedule) {
    changes.push("Ablauf geändert");
  }

  if (existingEvent.food !== nextEvent.food) {
    changes.push("Essen geändert");
  }

  if (existingEvent.drinks !== nextEvent.drinks) {
    changes.push("Getränke geändert");
  }

  const paymentTypeChange = formatChangeText(
    "Zahlungsart",
    getPaymentTypeLabel(existingEvent.payment_type),
    getPaymentTypeLabel(nextEvent.payment_type)
  );
  if (paymentTypeChange) changes.push(paymentTypeChange);

  if (existingEvent.notes !== nextEvent.notes) {
    changes.push("Notizen geändert");
  }

  return {
    changes,
    nextEvent,
  };
}

export async function createEvent(
  prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const values = getFormValues(formData);
  const errors = validateEventValues(values);

  if (userError || !user) {
    return {
      message: "Du bist nicht eingeloggt.",
      errors: {
        general: "Bitte melde dich erneut an.",
      },
      values,
    };
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Bitte prüfe die markierten Felder.",
      errors,
      values,
    };
  }

  const { error } = await supabase.from("events").insert([
    {
      title: values.title,
      status: values.status,
      date: values.date,
      company_name: values.company_name || null,
      firstname: values.firstname || null,
      lastname: values.lastname || null,
      phone: values.phone || null,
      email: values.email || null,
      adults: parseOptionalInteger(values.adults),
      children: parseOptionalInteger(values.children),
      address: values.address || null,
      room: values.room || null,
      tech: values.tech || null,
      infrastructure: values.infrastructure || null,
      schedule: values.schedule || null,
      food: values.food || null,
      drinks: values.drinks || null,
      payment_type: values.payment_type || null,
      notes: values.notes || null,
      created_by: user.id,
    },
  ]);

  if (error) {
    return {
      message: "Das Event konnte nicht gespeichert werden.",
      errors: {
        general: error.message,
      },
      values,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateEvent(
  prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const id = String(formData.get("id") ?? "").trim();
  const values = getFormValues(formData);
  const errors = validateEventValues(values);

  if (userError || !user) {
    return {
      message: "Du bist nicht eingeloggt.",
      errors: {
        general: "Bitte melde dich erneut an.",
      },
      values,
    };
  }

  if (!id) {
    return {
      message: "Das Event konnte nicht aktualisiert werden.",
      errors: {
        general: "Keine Event-ID gefunden.",
      },
      values,
    };
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Bitte prüfe die markierten Felder.",
      errors,
      values,
    };
  }

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("events")
    .select(`
      id,
      title,
      date,
      status,
      company_name,
      firstname,
      lastname,
      phone,
      email,
      adults,
      children,
      address,
      room,
      tech,
      infrastructure,
      schedule,
      food,
      drinks,
      payment_type,
      notes
    `)
    .eq("id", id)
    .single<ExistingEvent>();

  if (existingEventError || !existingEvent) {
    return {
      message: "Event konnte nicht aktualisiert werden.",
      errors: {
        general: "Bestehende Event-Daten konnten nicht geladen werden.",
      },
      values,
    };
  }

  const { changes, nextEvent } = buildChangeLog(existingEvent, values);

  const { error } = await supabase
    .from("events")
    .update({
      title: nextEvent.title,
      status: nextEvent.status,
      date: nextEvent.date,
      company_name: nextEvent.company_name,
      firstname: nextEvent.firstname,
      lastname: nextEvent.lastname,
      phone: nextEvent.phone,
      email: nextEvent.email,
      adults: nextEvent.adults,
      children: nextEvent.children,
      address: nextEvent.address,
      room: nextEvent.room,
      tech: nextEvent.tech,
      infrastructure: nextEvent.infrastructure,
      schedule: nextEvent.schedule,
      food: nextEvent.food,
      drinks: nextEvent.drinks,
      payment_type: nextEvent.payment_type,
      notes: nextEvent.notes,
    })
    .eq("id", id);

  if (error) {
    return {
      message: "Event konnte nicht aktualisiert werden.",
      errors: {
        general: error.message,
      },
      values,
    };
  }

  if (changes.length > 0) {
    const { error: logError } = await supabase.from("event_logs").insert([
      {
        event_id: id,
        user_id: user.id,
        change: changes.join("\n"),
      },
    ]);

    if (logError) {
      console.error("Fehler beim Schreiben des Event-Logs:", logError.message);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  redirect(`/dashboard/events/${id}`);
}