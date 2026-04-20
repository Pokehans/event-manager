import { createClient } from "@/lib/supabase/server";

export type CalendarEvent = {
  id: string;
  title: string;
  status: string;
  date: string;
  company_name: string | null;
  lastname: string | null;
  created_by: string | null;
  hasChanges: boolean;
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

type RawEventLog = {
  id: string;
};

type RawCalendarEvent = {
  id: string;
  title: string;
  status: string;
  date: string;
  company_name: string | null;
  lastname: string | null;
  created_by: string | null;
  event_logs?: RawEventLog[] | null;
  users?: RawUser | RawUser[] | null;
};

function formatLocalDate(year: number, month: number, day: number) {
  const monthString = String(month + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  return `${year}-${monthString}-${dayString}`;
}

function getTodayString() {
  const today = new Date();
  return formatLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getEventsForMonth(
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  const supabase = await createClient();

  const lastDay = new Date(year, month + 1, 0).getDate();

  const start = formatLocalDate(year, month, 1);
  const end = formatLocalDate(year, month, lastDay);
  const todayString = getTodayString();

  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      status,
      date,
      company_name,
      lastname,
      created_by,
      event_logs (
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
    `)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Events:", error.message);
    return [];
  }

  return ((data ?? []) as RawCalendarEvent[]).map((event) => {
    const rawUser = pickOne(event.users);
    const rawDepartment = pickOne(rawUser?.departments);
    const hasLogs = (event.event_logs?.length ?? 0) > 0;
    const isTodayOrFuture = event.date >= todayString;

    return {
      id: event.id,
      title: event.title,
      status: event.status,
      date: event.date,
      company_name: event.company_name,
      lastname: event.lastname,
      created_by: event.created_by,
      hasChanges: hasLogs && isTodayOrFuture,
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