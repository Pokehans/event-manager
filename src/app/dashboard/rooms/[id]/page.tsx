import Link from "next/link";
import { notFound } from "next/navigation";
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
  equipment: string[] | null;
  internal_notes: string | null;
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

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser({ redirectTo: "/" });
  const supabase = await createClient();

  const canManageRooms = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !room) {
    notFound();
  }

  const r = room as Room;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            {r.name}
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Raumdetails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/rooms"
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
          >
            Zurück
          </Link>

          {canManageRooms ? (
            <Link
              href={`/dashboard/rooms/${r.id}/edit`}
              className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
              Bearbeiten
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold">Basisdaten</h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Kapazität:</span>{" "}
                {r.capacity ? `${r.capacity} Personen` : "—"}
              </p>

              <p>
                <span className="font-semibold">Status:</span>{" "}
                {getStatusLabel(r.status)}
              </p>

              <p>
                <span className="font-semibold">Nutzung:</span>{" "}
                {r.function_description || "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold">Interne Informationen</h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Ausstattung:</span>{" "}
                {r.equipment?.length ? r.equipment.join(", ") : "—"}
              </p>

              <p>
                <span className="font-semibold">Notizen:</span>{" "}
                {r.internal_notes || "—"}
              </p>

              <p className="text-[var(--color-text-muted)]">
                Erstellt: {new Date(r.created_at).toLocaleString("de-CH")}
              </p>

              <p className="text-[var(--color-text-muted)]">
                Zuletzt bearbeitet: {new Date(r.updated_at).toLocaleString("de-CH")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold">Bilder</h2>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Bilder werden im nächsten Schritt ergänzt.
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold">Dokumente</h2>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Dokumente wie Bestuhlungspläne werden im nächsten Schritt ergänzt.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}