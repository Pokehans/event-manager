import { notFound, redirect } from "next/navigation";
import { getEventById } from "@/lib/events/get-event-by-id";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { EventForm } from "../../new/event-form";
import { updateEvent } from "../../new/actions";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canEdit =
    currentUser &&
    hasRole(currentUser.role, [
      ROLES.EDITOR,
      ROLES.ADMIN,
      ROLES.SYSTEMADMIN,
    ]);

  if (!canEdit) {
    redirect(`/dashboard/events/${id}`);
  }

  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();

  const { data: activeRooms } = await supabase
    .from("rooms")
    .select("id, name, status")
    .eq("status", "active")
    .order("name", { ascending: true });

  const currentRoomId = event.room ?? "";

  const currentRoomAlreadyIncluded = (activeRooms ?? []).some(
    (room) => room.id === currentRoomId
  );

  const { data: currentRoom } =
    currentRoomId && isUuid(currentRoomId) && !currentRoomAlreadyIncluded
      ? await supabase
          .from("rooms")
          .select("id, name, status")
          .eq("id", currentRoomId)
          .maybeSingle()
      : { data: null };

  const roomOptions = [
    { value: "", label: "Kein Raum" },
    ...(activeRooms ?? []).map((room) => ({
      value: room.id,
      label: room.name,
      status: room.status,
    })),
    ...(currentRoom
      ? [
          {
            value: currentRoom.id,
            label: currentRoom.name,
            status: currentRoom.status,
          },
        ]
      : currentRoomId && !isUuid(currentRoomId)
        ? [
            {
              value: currentRoomId,
              label: currentRoomId,
              status: "legacy",
            },
          ]
        : []),
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">Event bearbeiten</h1>
        <p className="page-subtitle">
          Bestehendes Event anpassen und aktualisieren.
        </p>
      </div>

      <EventForm
        mode="edit"
        submitLabel="Änderungen speichern"
        initialData={event}
        roomOptions={roomOptions}
        action={updateEvent}
      />
    </div>
  );
}