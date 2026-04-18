import { createClient } from "@/lib/supabase/server";

export type CalendarEvent = {
  id: string;
  title: string;
  status: string;
  date: string;
  company_name: string | null;
  lastname: string | null;
  created_by: string | null;
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

function formatLocalDate(year: number, month: number, day: number) {
  const monthString = String(month + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  return `${year}-${monthString}-${dayString}`;
}

export async function getEventsForMonth(year: number, month: number) {
  const supabase = await createClient();

  const lastDay = new Date(year, month + 1, 0).getDate();

  const start = formatLocalDate(year, month, 1);
  const end = formatLocalDate(year, month, lastDay);

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

  return (data ?? []) as CalendarEvent[];
}