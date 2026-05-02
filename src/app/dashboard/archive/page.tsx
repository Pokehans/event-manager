import { getArchivedEvents } from "@/lib/events/get-archived-events";
import EventsTable from "@/components/events/events-table";

type ArchivePageProps = {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;

  const events = await getArchivedEvents({
    from: params?.from,
    to: params?.to,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Archiv</h1>
        <p className="page-description">
          Abgeschlossene und archivierte Events
        </p>
      </div>

      <EventsTable events={events} from="archive" variant="archive" />
    </div>
  );
}