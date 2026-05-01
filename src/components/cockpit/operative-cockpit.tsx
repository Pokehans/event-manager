"use client";

import { useState } from "react";
import Link from "next/link";
import type { EventListItem } from "@/lib/events/get-events";
import StatusBadge from "@/components/ui/status-badge";

type OperativeCockpitProps = {
  events: EventListItem[];
};

const PREVIEW_LIMIT = 4;

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

function hasDebriefing(event: EventListItem) {
  return (event.event_debriefings?.length ?? 0) > 0;
}

function EventMiniCard({ event }: { event: EventListItem }) {
  return (
    <Link
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
  );
}

function ExpandableEventList({
  events,
  emptyText,
}: {
  events: EventListItem[];
  emptyText: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleEvents = showAll ? events : events.slice(0, PREVIEW_LIMIT);
  const hiddenCount = events.length - PREVIEW_LIMIT;

  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-text-muted)]">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {visibleEvents.map((event) => (
        <EventMiniCard key={event.id} event={event} />
      ))}

      {events.length > PREVIEW_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
        >
          {showAll ? "Weniger anzeigen" : `${hiddenCount} weitere anzeigen`}
        </button>
      ) : null}
    </div>
  );
}

function StatusOverviewCard({
  label,
  description,
  count,
  href,
}: {
  label: string;
  description: string;
  count: number;
  href: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {count} {label}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
        >
          Anzeigen
        </Link>
      </div>
    </div>
  );
}

export default function OperativeCockpit({ events }: OperativeCockpitProps) {
  const today = getTodayString();

  const activeEvents = events.filter((event) => event.status !== "Archiviert");

  const upcomingEvents = activeEvents
    .filter((event) => event.date >= today)
    .slice(0, 8);

  const todayEvents = activeEvents.filter((event) => event.date === today);

  const requestEvents = activeEvents.filter(
    (event) => event.date >= today && event.status === "Anfrage"
  );

  const progressEvents = activeEvents.filter(
    (event) => event.date >= today && event.status === "In Bearbeitung"
  );

  const cancelledEvents = activeEvents
    .filter((event) => event.date >= today && event.status === "Storniert")
    .slice(0, 3);

  const eventsWithoutRoom = activeEvents.filter(
    (event) => event.date >= today && !event.room?.trim()
  );

  const openDebriefingEvents = activeEvents.filter(
    (event) => event.date < today && !hasDebriefing(event)
  );

  const importantHintCount =
    openDebriefingEvents.length + eventsWithoutRoom.length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Wichtige Hinweise
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {importantHintCount} Punkte benötigen operative Aufmerksamkeit.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {openDebriefingEvents.length} Nachbereitung offen
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Vergangene Events ohne Debriefing.
              </p>

              <div className="mt-3">
                <ExpandableEventList
                  events={openDebriefingEvents}
                  emptyText="Keine offenen Nachbereitungen."
                />
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {eventsWithoutRoom.length} Ohne Raum
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Kommende Events ohne Raumzuteilung.
              </p>

              <div className="mt-3">
                <ExpandableEventList
                  events={eventsWithoutRoom}
                  emptyText="Alle kommenden Events haben eine Raumzuteilung."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Nächste Events
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Die nächsten geplanten Veranstaltungen.
            </p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
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
                <EventMiniCard key={event.id} event={event} />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-sm text-[var(--color-text-muted)]">
                Heute sind keine Events geplant.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Statusübersicht
          </h2>

          <div className="mt-4 space-y-3">
            <StatusOverviewCard
              label="Anfragen"
              description="Neue oder noch unbeantwortete Eventanfragen."
              count={requestEvents.length}
              href="/dashboard/events?status=Anfrage"
            />

            <StatusOverviewCard
              label="In Bearbeitung"
              description="Laufende Events in Planung oder Abstimmung."
              count={progressEvents.length}
              href="/dashboard/events?status=In%20Bearbeitung"
            />

            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {cancelledEvents.length} Stornierte Events
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Kommende abgesagte Veranstaltungen.
              </p>

              <div className="mt-3 space-y-2">
                {cancelledEvents.length > 0 ? (
                  cancelledEvents.map((event) => (
                    <EventMiniCard key={event.id} event={event} />
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-text-muted)]">
                    Keine kommenden stornierten Events.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}