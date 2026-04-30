import { getArchivedEvents } from "@/lib/events/get-archived-events";
import EventsTable from "@/components/events/events-table";

export default async function ArchivePage() {
  const events = await getArchivedEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Archiv</h1>
        <p className="page-description">
          Abgeschlossene und archivierte Events
        </p>
      </div>

      <EventsTable events={events} from="archive" />
    </div>
  );
}