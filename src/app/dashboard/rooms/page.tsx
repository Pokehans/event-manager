import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import StatusBadge from "@/components/ui/status-badge";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            Raumverwaltung
            </h1>
            <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Übersicht aller Räume
            </p>
        </div>

        {canManageRooms ? (
            <div className="flex flex-wrap items-center gap-2">
            <Link
                href="/dashboard/rooms/new"
                className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
            >
                Raum erstellen
            </Link>
            </div>
        ) : null}
        </div>

      {roomList.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <h2 className="section-title">Keine Räume erfasst</h2>
          <p className="section-text mt-2">
            Erstelle den ersten Raum, um die Raumverwaltung zu nutzen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="w-[140px] px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Raum</th>
                  <th className="w-[160px] px-5 py-4 font-bold">Kapazität</th>
                  <th className="px-5 py-4 font-bold">Nutzung</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {roomList.map((room) => (
                  <tr
                    key={room.id}
                    className="group cursor-pointer transition hover:bg-[var(--color-surface-muted)]/70"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/rooms/${room.id}`} className="block">
                        <StatusBadge label={getStatusLabel(room.status)} />
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-semibold text-[var(--color-text)]">
                      <Link href={`/dashboard/rooms/${room.id}`} className="block">
                        {room.name}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Link href={`/dashboard/rooms/${room.id}`} className="block">
                        {room.capacity ? `${room.capacity} Personen` : "—"}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      <Link href={`/dashboard/rooms/${room.id}`} className="block">
                        {room.function_description || "—"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--color-border)] lg:hidden">
            {roomList.map((room) => (
              <Link
                key={room.id}
                href={`/dashboard/rooms/${room.id}`}
                className="block p-5 transition hover:bg-[var(--color-surface-muted)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold text-[var(--color-text)]">
                      {room.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {room.capacity ? `${room.capacity} Personen` : "Keine Kapazität"}
                    </p>
                  </div>

                  <StatusBadge label={getStatusLabel(room.status)} />
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Nutzung
                  </p>
                  <p className="break-words text-sm text-[var(--color-text)]">
                    {room.function_description || "—"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}