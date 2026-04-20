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

  const { error } = await supabase
    .from("events")
    .update({
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

  const { error: logError } = await supabase.from("event_logs").insert([
    {
      event_id: id,
      user_id: user.id,
      change: "Event bearbeitet",
    },
  ]);

  if (logError) {
    console.error("Fehler beim Schreiben des Event-Logs:", logError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  redirect(`/dashboard/events/${id}`);
}