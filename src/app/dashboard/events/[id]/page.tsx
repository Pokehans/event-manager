import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/status-badge";
import { getEventById } from "@/lib/events/get-event-by-id";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "anfrage":
    case "Anfrage":
      return "Anfrage";
    case "bearbeitung":
    case "In Bearbeitung":
      return "In Bearbeitung";
    case "bestaetigt":
    case "Bestätigt":
      return "Bestätigt";
    case "storniert":
    case "Storniert":
      return "Storniert";
    case "archiviert":
    case "Archiviert":
      return "Archiviert";
    default:
      return status;
  }
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function getDisplayName(firstname: string | null, lastname: string | null) {
  const fullName = [firstname, lastname].filter(Boolean).join(" ").trim();
  return fullName || "—";
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const creatorEmail = event.users?.email ?? "—";
  const creatorDepartment = event.users?.departments?.name ?? "—";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="page-subtitle">Detailansicht des Events</p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:justify-end">
          <StatusBadge label={getStatusLabel(event.status)} />

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
              Zurück zum Dashboard
            </Link>

            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
              Bearbeiten
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="space-y-1">
            <h2 className="section-title">Event Infos</h2>
            <p className="section-text">
              Grunddaten und aktueller Stand des Events.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Datum
              </p>
              <p className="mt-1 text-sm">{formatDate(event.date)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Status
              </p>
              <div className="mt-1">
                <StatusBadge label={getStatusLabel(event.status)} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Firma
              </p>
              <p className="mt-1 text-sm">{event.company_name || "—"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Kontaktperson
              </p>
              <p className="mt-1 text-sm">
                {getDisplayName(event.firstname, event.lastname)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Event-ID
              </p>
              <p className="mt-1 break-all text-sm">{event.id}</p>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="section-title">Erstellt von</h2>
            <p className="section-text">Interne Zuordnung des Eintrags.</p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Benutzer
              </p>
              <p className="mt-1 break-all text-sm">{creatorEmail}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Department
              </p>
              <p className="mt-1 text-sm">{creatorDepartment}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Erstellt am
              </p>
              <p className="mt-1 text-sm">
                {event.created_at
                  ? new Date(event.created_at).toLocaleString("de-CH")
                  : "—"}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="section-title">Notizen</h2>
          <p className="section-text">Zusätzliche Informationen zum Event.</p>
        </div>

        <div className="mt-6 rounded-xl bg-[var(--color-surface-muted)] p-4">
          <p className="whitespace-pre-wrap text-sm">
            {event.notes?.trim() || "Keine Notizen vorhanden."}
          </p>
        </div>
      </section>
    </div>
  );
}