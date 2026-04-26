import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES } from "@/lib/auth/roles";
import OperativeCockpit from "@/components/cockpit/operative-cockpit";
import { getEvents } from "@/lib/events/get-events";

export default async function CockpitPage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  const isAdminView =
    user.role === ROLES.ADMIN || user.role === ROLES.SYSTEMADMIN;

  const events = await getEvents();

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
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Admin-Auswertung
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Diese Kennzahlen sind nur für Admins und Systemadmins sichtbar.
          </p>
        </section>
      ) : null}
    </div>
  );
}