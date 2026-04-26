import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES } from "@/lib/auth/roles";
import OperativeCockpit from "@/components/cockpit/operative-cockpit";
import { getEvents } from "@/lib/events/get-events";
import Link from "next/link";

export default async function CockpitPage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  const isAdminView =
    user.role === ROLES.ADMIN || user.role === ROLES.SYSTEMADMIN;

  const events = await getEvents();
  const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyEvents = events.filter(
    (event) => event.date.slice(0, 7) === currentMonth
    );

    const confirmedEvents = monthlyEvents.filter(
    (event) => event.status === "Bestätigt"
    );

    const progressEvents = monthlyEvents.filter(
    (event) => event.status === "In Bearbeitung"
    );

    const archivedEvents = events.filter(
    (event) => event.status === "Archiviert"
    );

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">Cockpit</h1>
        <p className="page-subtitle">
          Operative Übersicht über anstehende Events und wichtige Hinweise.
        </p>
      </div>

      <OperativeCockpit events={events} />

      {isAdminView ? (
        <section className="space-y-4">
            <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Kennzahlen
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
                Übersicht für Administration und Planung.
            </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                    href={`/dashboard/events?month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                        Events diesen Monat
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {monthlyEvents.length}
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                        Anzeigen
                    </span>
                    </div>
                </Link>

                <Link
                    href={`/dashboard/events?status=Bestätigt&month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Bestätigt</p>
                        <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {confirmedEvents.length}
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                        Anzeigen
                    </span>
                    </div>
                </Link>

                <Link
                    href={`/dashboard/events?status=In%20Bearbeitung&month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                        In Bearbeitung
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {progressEvents.length}
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                        Anzeigen
                    </span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/events?status=Archiviert&past=1"
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                        Archiviert gesamt
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {archivedEvents.length}
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                        Anzeigen
                    </span>
                    </div>
                </Link>
            </div>
        </section>
        ) : null}
    </div>
  );
}