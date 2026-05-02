import { createClient } from "@/lib/supabase/server";
import type { EventListItem } from "@/lib/events/get-events";

type RawDepartment = {
  id: string;
  name: string;
  color: string;
};

type RawUser = {
  id: string;
  departments?: RawDepartment | RawDepartment[] | null;
};

type RawArchivedEvent = Omit<EventListItem, "users" | "event_debriefings"> & {
  users?: RawUser | RawUser[] | null;
  event_debriefings?: { rating: string | null }[] | null;
};

export type ArchivedEventListItem = Omit<EventListItem, "event_debriefings"> & {
  event_debriefings: { rating: string | null }[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getArchivedEvents(): Promise<ArchivedEventListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      status,
      date,
      company_name,
      firstname,
      lastname,
      adults,
      children,
      room,
      payment_type,
      event_debriefings (
        rating
      ),
      users:created_by (
        id,
        departments:department_id (
          id,
          name,
          color
        )
      )
    `)
    .eq("status", "Archiviert")
    .order("date", { ascending: false });

  if (error) {
    console.error("Fehler beim Laden der archivierten Events:", error.message);
    return [];
  }

  return ((data ?? []) as RawArchivedEvent[]).map((event) => {
    const rawUser = pickOne(event.users);
    const rawDepartment = pickOne(rawUser?.departments);

    return {
      ...event,
      event_debriefings: event.event_debriefings ?? null,
      users: rawUser
        ? {
            id: rawUser.id,
            departments: rawDepartment
              ? {
                  id: rawDepartment.id,
                  name: rawDepartment.name,
                  color: rawDepartment.color,
                }
              : null,
          }
        : null,
    };
  });
}