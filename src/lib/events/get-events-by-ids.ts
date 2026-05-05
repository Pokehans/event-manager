import { createClient } from "@/lib/supabase/server";
import type { EventDetail } from "@/lib/events/get-event-by-id";

type RawDepartment = {
  id: string;
  name: string;
  color: string;
};

type RawEventUser = {
  id: string;
  email: string | null;
  role: string | null;
  departments?: RawDepartment | RawDepartment[] | null;
};

type RawEventData = Omit<EventDetail, "users" | "debriefing" | "logs"> & {
  users?: RawEventUser | RawEventUser[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getEventsByIds(ids: string[]): Promise<EventDetail[]> {
  if (ids.length === 0) return [];

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
      billing_company_name,
      billing_firstname,
      billing_lastname,
      billing_address,
      billing_phone,
      billing_email,
      notes,
      created_by,
      created_at,
      users:created_by (
        id,
        email,
        role,
        departments:department_id (
          id,
          name,
          color
        )
      )
    `)
    .in("id", ids);

  if (error || !data) {
    console.error("Fehler beim Laden der Events:", error?.message);
    return [];
  }

  const events = (data as RawEventData[]).map((rawEvent) => {
    const rawUser = pickOne(rawEvent.users);
    const rawDepartment = pickOne(rawUser?.departments);

    return {
      ...rawEvent,
      users: rawUser
        ? {
            id: rawUser.id,
            email: rawUser.email,
            role: rawUser.role,
            departments: rawDepartment
              ? {
                  id: rawDepartment.id,
                  name: rawDepartment.name,
                  color: rawDepartment.color,
                }
              : null,
          }
        : null,
      debriefing: null,
      logs: [],
    };
  });

    const eventsById = new Map(events.map((event) => [event.id, event]));

    const orderedEvents: EventDetail[] = [];

    for (const id of ids) {
        const event = eventsById.get(id);

        if (event) {
        orderedEvents.push(event);
        }
    }

    return orderedEvents;
}