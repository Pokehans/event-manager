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

type RawEventDetail = {
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
    | Array<{
        id: string;
        email: string | null;
        role: string | null;
        departments:
          | Array<{
              id: string;
              name: string;
              color: string;
            }>
          | null;
      }>
    | null;
};

export async function getEventById(id: string): Promise<EventDetail | null> {
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

  if (error || !data) {
    console.error("Fehler beim Laden des Events:", error?.message);
    return null;
  }

  const raw = data as RawEventDetail;

  const user = raw.users?.[0] ?? null;
  const department = user?.departments?.[0] ?? null;

  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    date: raw.date,
    company_name: raw.company_name,
    firstname: raw.firstname,
    lastname: raw.lastname,
    notes: raw.notes,
    created_by: raw.created_by,
    created_at: raw.created_at,
    users: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          departments: department
            ? {
                id: department.id,
                name: department.name,
                color: department.color,
              }
            : null,
        }
      : null,
  };
}