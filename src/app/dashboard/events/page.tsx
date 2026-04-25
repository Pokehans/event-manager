import EventsTable from "@/components/events/events-table";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEvents } from "@/lib/events/get-events";

export default async function EventsPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  if (!currentUser) return null;

  const events = await getEvents();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="page-title">Eventliste</h1>
          <p className="page-subtitle">
            Tabellarische Übersicht aller Events. Kommende Events werden zuerst angezeigt.
          </p>
        </div>
      </div>

      <EventsTable events={events} />
    </div>
  );
}