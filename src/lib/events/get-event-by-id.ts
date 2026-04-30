import { createClient } from "@/lib/supabase/server";

export type EventLogEntry = {
  id: string;
  change: string;
  created_at: string | null;
  user_id: string | null;
  users:
    | {
        id: string;
        email: string | null;
      }
    | null;
};

export type EventDebriefing = {
  id: string;
  text: string;
  created_at: string | null;
  user_id: string | null;
  users:
    | {
        id: string;
        email: string | null;
      }
    | null;
};

export type EventDetail = {
  id: string;
  title: string;
  status: string;
  date: string;
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
  created_by: string | null;
  created_at: string | null;
  users:
    | {
        id: string;
        email: string | null;
        role: string | null;
        departments:
          | {
              id: string;
              name: string;
              color: string;
            }
          | null;
      }
    | null;
    debriefing: EventDebriefing | null;
  logs: EventLogEntry[];
};

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

type RawLogUser = {
  id: string;
  email: string | null;
};

type RawEventData = {
  id: string;
  title: string;
  status: string;
  date: string;
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
  created_by: string | null;
  created_at: string | null;
  users?: RawEventUser | RawEventUser[] | null;
};

type RawLogData = {
  id: string;
  change: string;
  created_at: string | null;
  user_id: string | null;
  users?: RawLogUser | RawLogUser[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const supabase = await createClient();

  const { data: eventData, error: eventError } = await supabase
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
    .eq("id", id)
    .single();

  if (eventError || !eventData) {
    console.error("Fehler beim Laden des Events:", eventError?.message);
    return null;
  }

  const { data: logData, error: logError } = await supabase
    .from("event_logs")
    .select(`
      id,
      change,
      created_at,
      user_id,
      users:user_id (
        id,
        email
      )
    `)
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  if (logError) {
    console.error("Fehler beim Laden der Event-Logs:", logError.message);
  }

const { data: debriefingData, error: debriefingError } = await supabase
  .from("event_debriefings")
  .select(`
    id,
    text,
    created_at,
    user_id,
    users:user_id (
      id,
      email
    )
  `)
  .eq("event_id", id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (debriefingError) {
  console.error(
    "Fehler beim Laden des Event-Debriefings:",
    debriefingError.message,
  );
}

  const rawEvent = eventData as RawEventData;
  const rawUser = pickOne(rawEvent.users);
  const rawDepartment = pickOne(rawUser?.departments);

  return {
    id: rawEvent.id,
    title: rawEvent.title,
    status: rawEvent.status,
    date: rawEvent.date,
    company_name: rawEvent.company_name,
    firstname: rawEvent.firstname,
    lastname: rawEvent.lastname,
    phone: rawEvent.phone,
    email: rawEvent.email,
    adults: rawEvent.adults,
    children: rawEvent.children,
    address: rawEvent.address,
    room: rawEvent.room,
    tech: rawEvent.tech,
    infrastructure: rawEvent.infrastructure,
    schedule: rawEvent.schedule,
    food: rawEvent.food,
    drinks: rawEvent.drinks,
    payment_type: rawEvent.payment_type,
    notes: rawEvent.notes,
    created_by: rawEvent.created_by,
    created_at: rawEvent.created_at,
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
    debriefing: debriefingData
      ? {
          id: debriefingData.id,
          text: debriefingData.text,
          created_at: debriefingData.created_at,
          user_id: debriefingData.user_id,
          users: pickOne(debriefingData.users),
        }
      : null,
    logs: ((logData ?? []) as RawLogData[]).map((log) => {
      const rawLogUser = pickOne(log.users);

      return {
        id: log.id,
        change: log.change,
        created_at: log.created_at,
        user_id: log.user_id,
        users: rawLogUser
          ? {
              id: rawLogUser.id,
              email: rawLogUser.email,
            }
          : null,
      };
    }),
  };
}