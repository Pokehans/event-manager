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

type GetArchivedEventsFilters = {
  from?: string;
  to?: string;
};

export async function getArchivedEvents(
  filters: GetArchivedEventsFilters = {}
): Promise<ArchivedEventListItem[]> {
  const supabase = await createClient();

  let query = supabase
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
    .eq("status", "Archiviert");

      if (filters.from) {
        query = query.gte("date", filters.from);
      }

      if (filters.to) {
        query = query.lt("date", filters.to);
      }

      const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    console.error("Fehler beim Laden der archivierten Events:", error.message);
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

    function getRoomNames(event: RawArchivedEvent) {
      return [event.room_id_1, event.room_id_2]
        .map((roomId) => rooms?.find((room) => room.id === roomId)?.name)
        .filter((roomName): roomName is string => Boolean(roomName));
    }

  return ((data ?? []) as RawArchivedEvent[]).map((event) => {
    const rawUser = pickOne(event.users);
    const rawDepartment = pickOne(rawUser?.departments);

    return {
      ...event,
      room_names: getRoomNames(event),
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