import Link from "next/link";
import type { EventListItem } from "@/lib/events/get-events";
import StatusBadge from "@/components/ui/status-badge";

type OperativeCockpitProps = {
  events: EventListItem[];
};

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getCustomerName(event: EventListItem) {
  if (event.company_name) return event.company_name;

  return [event.firstname, event.lastname].filter(Boolean).join(" ") || "—";
}

export default function OperativeCockpit({ events }: OperativeCockpitProps) {
  const today = getTodayString();

  const upcomingEvents = events
    .filter((event) => event.date >= today)
    .slice(0, 8);

  const todayEvents = events.filter((event) => event.date === today);

  const requestEvents = events.filter(
    (event) => event.date >= today && event.status === "Anfrage"
  );

  const progressEvents = events.filter(
    (event) => event.date >= today && event.status === "In Bearbeitung"
  );

  const cancelledEvents = events
    .filter((event) => event.date >= today && event.status === "Storniert")
    .slice(0, 3);

  const eventsWithoutRoom = events
    .filter((event) => event.date >= today && !event.room?.trim())
    .slice(0, 3);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Heute
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {todayEvents.length} Event{todayEvents.length === 1 ? "" : "s"} heute
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}?from=cockpit`}
                  className="block rounded-xl border border-[var(--color-border)] p-3 transition hover:bg-[var(--color-surface-muted)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {formatDate(event.date)} · {getCustomerName(event)}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      Anzeigen
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-sm text-[var(--color-text-muted)]">
                Heute sind keine Events geplant.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Hinweise
          </h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {requestEvents.length} Anfragen
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Neue oder noch unbeantwortete Eventanfragen.
                  </p>
                </div>

                <Link
                  href="/dashboard/events?status=Anfrage"
                  className="text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
                >
                  Anzeigen
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {progressEvents.length} In Bearbeitung
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Laufende Events in Planung oder Abstimmung.
                  </p>
                </div>

                <Link
                  href="/dashboard/events?status=In%20Bearbeitung"
                  className="text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
                >
                  Anzeigen
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {cancelledEvents.length} Stornierte Events
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Kommende abgesagte Veranstaltungen.
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {cancelledEvents.length > 0 ? (
                  cancelledEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.id}?from=cockpit`}
                      className="block rounded-lg border border-[var(--color-border)] bg-white p-3 transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {event.title}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {formatDate(event.date)} · {getCustomerName(event)}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-[var(--color-primary)]">
                          Anzeigen
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-text-muted)]">
                    Keine kommenden stornierten Events.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {eventsWithoutRoom.length} Ohne Raum
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Kommende Events ohne Raumzuteilung.
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {eventsWithoutRoom.length > 0 ? (
                  eventsWithoutRoom.map((event) => (
                    <Link
                      key={event.id}
                      href={`/dashboard/events/${event.id}?from=cockpit`}
                      className="block rounded-lg border border-[var(--color-border)] bg-white p-3 transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {event.title}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {formatDate(event.date)} · {getCustomerName(event)}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-[var(--color-primary)]">
                          Anzeigen
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-text-muted)]">
                    Alle kommenden Events haben eine Raumzuteilung.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Nächste Events
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Die nächsten geplanten Veranstaltungen.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}?from=cockpit`}
                className="block rounded-xl border border-[var(--color-border)] p-4 transition hover:bg-[var(--color-surface-muted)]"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {formatDate(event.date)} · {getCustomerName(event)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge label={event.status} />
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      Anzeigen
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-muted)]">
              Keine kommenden Events vorhanden.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}