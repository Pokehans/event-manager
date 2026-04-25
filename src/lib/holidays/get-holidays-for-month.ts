import { createClient } from "@/lib/supabase/server";

export type CalendarHoliday = {
  id: string;
  name: string;
  date: string;
  type: string;
  color: string;
  background_color: string;
};

function formatLocalDate(year: number, month: number, day: number) {
  const monthString = String(month + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");

  return `${year}-${monthString}-${dayString}`;
}

export async function getHolidaysForMonth(
  year: number,
  month: number
): Promise<CalendarHoliday[]> {
  const supabase = await createClient();

  const lastDay = new Date(year, month + 1, 0).getDate();

  const start = formatLocalDate(year, month, 1);
  const end = formatLocalDate(year, month, lastDay);

  const { data, error } = await supabase
    .from("holidays")
    .select("id, name, date, type, color, background_color")
    .eq("is_active", true)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Feiertage:", error.message);
    return [];
  }

  return data ?? [];
}