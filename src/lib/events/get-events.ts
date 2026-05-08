import { createClient } from "@/lib/supabase/server";

export type EventListItem = {
  id: string;
  title: string;
  status: string;
  date: string;
  company_name: string | null;
  firstname: string | null;
  lastname: string | null;
  adults: number | null;
  children: number | null;
  room_id_1: string | null;
  room_id_2: string | null;
  room_names: string[];
  payment_type: string | null;
  event_debriefings:
    | {
        id: string;
      }[]
    | null;
  users:
    | {
        id: string;
        departments:
          | {
              id: string;
              name: string;
              color: string;
            }
          | null;
      }
    | null;
};

type RawDepartment = {
  id: string;
  name: string;
  color: string;
};

type RawUser = {
  id: string;
  departments?: RawDepartment | RawDepartment[] | null;
};

type RawEvent = Omit<EventListItem, "users"> & {
  users?: RawUser | RawUser[] | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getEvents(): Promise<EventListItem[]> {
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
      room_id_1,
      room_id_2,
      payment_type,
      event_debriefings (
        id
      ),
      users:created_by (
        id,
        departments:department_id (
          id,
          name,
          color
        )
      )
    `);

  if (error) {
    console.error("Fehler beim Laden der Eventliste:", error.message);
    return [];
  }

  const roomIds = Array.from(
    new Set(
      (data ?? [])
        .flatMap((event) => [event.room_id_1, event.room_id_2])
        .filter((roomId): roomId is string => Boolean(roomId))
    )
  );

  const { data: rooms, error: roomsError } =
    roomIds.length > 0
      ? await supabase.from("rooms").select("id, name").in("id", roomIds)
      : { data: [], error: null };

  if (roomsError) {
    console.error("Fehler beim Laden der Raumnamen:", roomsError.message);
  }

  function getRoomNames(event: RawEvent) {
    return [event.room_id_1, event.room_id_2]
      .map((roomId) => rooms?.find((room) => room.id === roomId)?.name)
      .filter((roomName): roomName is string => Boolean(roomName));
  }

  const today = getTodayString();

  return ((data ?? []) as RawEvent[])
    .map((event) => {
      const rawUser = pickOne(event.users);
      const rawDepartment = pickOne(rawUser?.departments);

      return {
        ...event,
        room_names: getRoomNames(event),
        event_debriefings: event.event_debriefings ?? [],
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
    })
    .sort((a, b) => {
      const aUpcoming = a.date >= today;
      const bUpcoming = b.date >= today;

      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;

      return aUpcoming
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
}