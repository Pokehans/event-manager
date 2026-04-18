import { createClient } from "@/lib/supabase/server";

export type EventDetail = {
  id: string;
  title: string;
  status: string;
  date: string;
  company_name: string | null;
  firstname: string | null;
  lastname: string | null;
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
};

export async function getEventById(id: string) {
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

  if (error) {
    console.error("Fehler beim Laden des Events:", error.message);
    return null;
  }

  return data as EventDetail;
}