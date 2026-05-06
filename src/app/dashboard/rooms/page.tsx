import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import Card from "@/components/ui/card";

type Room = {
  id: string;
  name: string;
  capacity: number | null;
  function_description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Aktiv";
    case "inactive":
      return "Inaktiv";
    case "blocked":
      return "Gesperrt";
    default:
      return status;
  }
}

export default async function RoomsPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });
  const supabase = await createClient();

  const canManageRooms = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id, name, capacity, function_description, status, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Räume:", error.message);
  }

  const roomList = (rooms ?? []) as Room[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Räume
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Raumverwaltung
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            Übersicht aller Räume mit Kapazität, Nutzung und Status.
          </p>
        </div>

        {canManageRooms ? (
          <Link
            href="/dashboard/rooms/new"
            className="inline-flex rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Raum erstellen
          </Link>
        ) : null}
      </div>

      {roomList.length === 0 ? (
        <Card>
          <div className="p-6 text-sm text-[var(--color-text-muted)]">
            Noch keine Räume erfasst.
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-5 py-4">Raum</th>
                  <th className="px-5 py-4">Kapazität</th>
                  <th className="px-5 py-4">Nutzung</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aktion</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {roomList.map((room) => (
                  <tr key={room.id} className="transition hover:bg-[var(--color-surface-muted)]">
                    <td className="px-5 py-4 font-semibold">{room.name}</td>
                    <td className="px-5 py-4">
                      {room.capacity ? `${room.capacity} Personen` : "—"}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {room.function_description || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {getStatusLabel(room.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/rooms/${room.id}`}
                        className="font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}