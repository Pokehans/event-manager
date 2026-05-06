import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { RoomForm } from "../../new/room-form";
import { updateRoom } from "./actions";

type Room = {
  id: string;
  name: string;
  capacity: number | null;
  function_description: string | null;
  status: string;
  equipment: string[] | null;
  internal_notes: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditRoomPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser({ redirectTo: "/" });

  if (!currentUser || !hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])) {
    redirect("/dashboard/rooms");
  }

  const supabase = await createClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("id, name, capacity, function_description, status, equipment, internal_notes")
    .eq("id", id)
    .single();

  if (error || !room) {
    notFound();
  }

  const r = room as Room;
  const updateRoomWithId = updateRoom.bind(null, r.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            Raum bearbeiten
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Bestehender Raum anpassen und aktualisieren.
          </p>
        </div>
      </div>

      <RoomForm
        mode="edit"
        action={updateRoomWithId}
        submitLabel="Änderungen speichern"
        pendingLabel="Änderungen werden gespeichert..."
        initialValues={{
          name: r.name,
          capacity: r.capacity?.toString() ?? "",
          function_description: r.function_description ?? "",
          status: r.status,
          equipment: r.equipment?.join(", ") ?? "",
          internal_notes: r.internal_notes ?? "",
        }}
      />
    </div>
  );
}