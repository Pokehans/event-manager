import Link from "next/link";
import StatusBadge from "@/components/ui/status-badge";
import type { EventListItem } from "@/lib/events/get-events";

type EventsTableProps = {
  events: EventListItem[];
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function getCustomerName(event: EventListItem) {
  const fullName = [event.firstname, event.lastname].filter(Boolean).join(" ");

  return event.company_name || fullName || "—";
}

function getPersonCount(event: EventListItem) {
  const adults = event.adults ?? 0;
  const children = event.children ?? 0;
  const total = adults + children;

  return total > 0 ? total : "—";
}

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

export default function EventsTable({ events }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <h2 className="section-title">Keine Events vorhanden</h2>
        <p className="section-text mt-2">
          Sobald Events erstellt wurden, erscheinen sie hier.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-5 py-4 font-bold">Datum</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Titel</th>
              <th className="px-5 py-4 font-bold">Auftraggeber</th>
              <th className="px-5 py-4 font-bold">Personen</th>
              <th className="px-5 py-4 font-bold">Bereich</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-border)]">
            {events.map((event) => {
              const department = event.users?.departments;

              return (
                <tr
                  key={event.id}
                  className="group cursor-pointer transition hover:bg-[var(--color-surface-muted)]/70"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      {formatDate(event.date)}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      <StatusBadge label={getStatusLabel(event.status)} />
                    </Link>
                  </td>

                  <td className="px-5 py-4 font-semibold text-[var(--color-text)]">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      {event.title}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-[var(--color-text-muted)]">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      {getCustomerName(event)}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      {getPersonCount(event)}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <Link href={`/dashboard/events/${event.id}?from=list`} className="block">
                      {department ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: department.color }}
                          />
                          {department.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-[var(--color-border)] lg:hidden">
        {events.map((event) => {
          const department = event.users?.departments;

          return (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}?from=list`}
              className="block p-5 transition hover:bg-[var(--color-surface-muted)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[var(--color-primary)]">
                    {formatDate(event.date)}
                  </p>
                  <h2 className="mt-1 font-bold">{event.title}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {getCustomerName(event)}
                  </p>
                </div>

                <StatusBadge label={getStatusLabel(event.status)} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)]">
                <p>Personen: {getPersonCount(event)}</p>
                <p>
                  Bereich:{" "}
                  {department ? (
                    <span className="inline-flex items-center gap-2 text-[var(--color-text)]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: department.color }}
                      />
                      {department.name}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}