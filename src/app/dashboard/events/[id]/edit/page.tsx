import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events/get-event-by-id";
import { EventForm } from "../../new/event-form";
import { updateEvent } from "../../new/actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

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
        action={updateEvent}
      />
    </div>
  );
}