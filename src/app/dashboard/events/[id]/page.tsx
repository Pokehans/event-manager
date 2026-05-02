import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/status-badge";
import { getEventById } from "@/lib/events/get-event-by-id";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { deleteEvent } from "@/app/dashboard/events/new/actions";
import DeleteEventButton from "@/components/events/delete-event-button";
import { ArchiveEventButton } from "./archive-event-button";
import { archiveEvent } from "./archive-event";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    month?: string;
    year?: string;
    from?: string;
    archiveError?: string;
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

function formatDateTime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("de-CH");
}

function getRoomLabel(room: string | null) {
  switch (room) {
    case "irgendwo":
      return "Irgendwo";
    case "restaurant":
      return "Restaurant";
    case "saal":
      return "Saal";
    case "seminarraum":
      return "Seminarraum";
    case "sitzungszimmer":
      return "Sitzungszimmer";
    case "terrasse":
      return "Terrasse";
    default:
      return room || "—";
  }
}

function getPaymentTypeLabel(paymentType: string | null) {
  switch (paymentType) {
    case "barzahlung":
      return "Barzahlung";
    case "rechnung":
      return "Rechnung";
    case "intern_bewohnende":
      return "Intern Bewohnende";
    case "intern_aktivierung":
      return "Intern Aktivierung";
    case "intern_mitarbeiter":
      return "Intern Mitarbeiter";
    case "intern_gl":
      return "Intern GL";
    case "intern_vr":
      return "Intern VR";
    default:
      return paymentType || "—";
  }
}

function getLogUserLabel(email: string | null) {
  return email || "Unbekannter Benutzer";
}

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

function DetailItem({ label, value, className = "" }: DetailItemProps) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

type DetailSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-text">{description}</p> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

type AuditLogListProps = {
  logs: {
    id: string;
    change: string;
    created_at: string | null;
    users:
      | {
          id: string;
          email: string | null;
        }
      | null;
  }[];
};

function renderLogChange(change: string) {
  return change
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const neuIndex = line.indexOf("Neu:");

      if (neuIndex === -1) {
        return (
          <p key={`${line}-${index}`} className="text-sm font-medium">
            {line}
          </p>
        );
      }

      const before = line.slice(0, neuIndex).trimEnd();
      const after = line.slice(neuIndex + 4).trim();

      return (
        <p key={`${line}-${index}`} className="text-sm font-medium">
          {before} <strong>Neu: {after} </strong>
        </p>
      );
    });
}

function AuditLogList({ logs }: AuditLogListProps) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
        >
          <div className="space-y-1">
            {renderLogChange(log.change)}
          </div>

          <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
            <p>{formatDateTime(log.created_at)}</p>
            <p>{getLogUserLabel(log.users?.email ?? null)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getDebriefingRatingLabel(rating: string | null | undefined) {
  switch (rating) {
    case "sehr_gut":
      return "Sehr gut";
    case "gut":
      return "Gut";
    case "neutral":
      return "Neutral";
    case "schlecht":
      return "Schlecht";
    default:
      return "—";
  }
}

export default async function EventDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;

  const month = query?.month;
  const year = query?.year;
  const from = query?.from;
  const archiveError = query?.archiveError;

  const backHref =
  from === "cockpit"
    ? "/dashboard/cockpit"
    : from === "archive"
      ? "/dashboard/archive"
      : from === "list"
        ? "/dashboard/events"
        : month && year
          ? `/dashboard?month=${month}&year=${year}`
          : "/dashboard";

  const backLabel =
  from === "cockpit"
    ? "Zurück zum Cockpit"
    : from === "archive"
      ? "Zurück zum Archiv"
      : from === "list"
        ? "Zurück zur Eventliste"
        : "Zurück zum Dashboard";
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canDelete =
    currentUser &&
    hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN]);

  const canEdit =
    currentUser &&
      hasRole(currentUser.role, [
        ROLES.EDITOR,
        ROLES.ADMIN,
        ROLES.SYSTEMADMIN,
      ]);

  const today = new Date().toISOString().slice(0, 10);
  const isPastEvent = event.date < today;
  const isArchived = event.status === "Archiviert";

  const canEditActiveEvent = canEdit && !isPastEvent && !isArchived;

  const canArchive =
    currentUser &&
    hasRole(currentUser.role, [
      ROLES.EDITOR,
      ROLES.ADMIN,
      ROLES.SYSTEMADMIN,
    ]) &&
    isPastEvent &&
    !isArchived;

  const creatorEmail = event.users?.email ?? "—";
  const creatorDepartment = event.users?.departments?.name ?? "—";

  const logs = event.logs ?? [];
  const debriefing = event.debriefing;
  const latestLogs = logs.slice(0, 3);
  const olderLogs = logs.slice(3);
  const hasLogs = logs.length > 0;
  const hasMoreLogs = logs.length > 3;
  const hasBillingAddress =
    !!event.billing_company_name ||
    !!event.billing_firstname ||
    !!event.billing_lastname ||
    !!event.billing_address ||
    !!event.billing_email;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="page-title">{event.title}</h1>
          <p className="page-subtitle">Detailansicht</p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
              {backLabel}
            </Link>

            {canEditActiveEvent ? (
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
              >
                Bearbeiten
              </Link>
            ) : null}

            {canDelete ? (
              <DeleteEventButton action={deleteEvent} eventId={event.id} />
            ) : null}

            {canArchive ? (
              <ArchiveEventButton eventId={event.id} action={archiveEvent} />
            ) : null}
          </div>
        </div>
      </div>
      
      {archiveError === "debriefing" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-[var(--color-text)]">
          <p className="font-semibold">Archivierung nicht möglich</p>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Bitte erfasse ein Debriefing mit mindestens 10 Zeichen, bevor du den
            Event archivierst.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailSection title="Basisdaten">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Datum" value={formatDate(event.date)} />
              <DetailItem
                label="Status"
                value={<StatusBadge label={getStatusLabel(event.status)} />}
              />
            </div>
          </DetailSection>

          <DetailSection title="Kontaktdaten">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Firma" value={event.company_name || "—"} />
              <DetailItem label="Vorname" value={event.firstname || "—"} />
              <DetailItem label="Nachname" value={event.lastname || "—"} />
              <DetailItem label="Telefon" value={event.phone || "—"} />
              <DetailItem label="E-Mail" value={event.email || "—"} />
              <DetailItem
                label="Adresse"
                value={event.address || "—"}
                className="sm:col-span-2"
              />
            </div>
          </DetailSection>

          {hasBillingAddress ? (
            <DetailSection title="Rechnungsadresse">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Firma"
                  value={event.billing_company_name || "—"}
                />
                <DetailItem
                  label="Vorname"
                  value={event.billing_firstname || "—"}
                />
                <DetailItem
                  label="Nachname"
                  value={event.billing_lastname || "—"}
                />
                <DetailItem
                  label="E-Mail"
                  value={event.billing_email || "—"}
                />
                <DetailItem
                  label="Telefon"
                  value={event.billing_phone || "—"}
                />
                <DetailItem
                  label="Adresse"
                  value={event.billing_address || "—"}
                  className="sm:col-span-2"
                />
              </div>
            </DetailSection>
          ) : null}

          <DetailSection title="Personenzahl">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Erwachsene" value={event.adults ?? "—"} />
              <DetailItem label="Kinder" value={event.children ?? "—"} />
            </div>
          </DetailSection>

          <DetailSection title="Organisation">
            <div className="grid gap-6">
              <DetailItem label="Raum" value={getRoomLabel(event.room)} />
              <DetailItem
                label="Ablauf"
                value={
                  <p className="whitespace-pre-wrap">{event.schedule || "—"}</p>
                }
              />
              <DetailItem
                label="Technik"
                value={<p className="whitespace-pre-wrap">{event.tech || "—"}</p>}
              />
              <DetailItem
                label="Infrastruktur"
                value={
                  <p className="whitespace-pre-wrap">
                    {event.infrastructure || "—"}
                  </p>
                }
              />
            </div>
          </DetailSection>

          <DetailSection title="Essen & Getränke">
            <div className="grid gap-6">
              <DetailItem
                label="Essen"
                value={<p className="whitespace-pre-wrap">{event.food || "—"}</p>}
              />
              <DetailItem
                label="Getränke"
                value={
                  <p className="whitespace-pre-wrap">{event.drinks || "—"}</p>
                }
              />
            </div>
          </DetailSection>

          <DetailSection title="Besonderes">
            <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
              <p className="whitespace-pre-wrap text-sm">
                {event.notes?.trim() || "Keine Notizen vorhanden."}
              </p>
            </div>
          </DetailSection>

          <DetailSection title="Zahlungsart">
            <DetailItem
              label="Zahlungsart"
              value={getPaymentTypeLabel(event.payment_type)}
            />
          </DetailSection>
          {debriefing ? (
            <DetailSection
              title="Debriefing"
              description="Nachbereitung und Abschlussnotizen zu diesem Event."
            >
              <div className="space-y-4 rounded-xl bg-[var(--color-surface-muted)] p-4">
                {"rating" in debriefing && debriefing.rating ? (
                  <>
                    <DetailItem
                      label="Wie lief das Event?"
                      value={getDebriefingRatingLabel(debriefing.rating)}
                    />

                    <DetailItem
                      label="Probleme / Auffälligkeiten"
                      value={
                        <p className="whitespace-pre-wrap">
                          {debriefing.issues?.trim() || "Keine besonderen Probleme erfasst."}
                        </p>
                      }
                    />

                    <DetailItem
                      label="Verbesserungen / Learnings"
                      value={
                        <p className="whitespace-pre-wrap">
                          {debriefing.learnings?.trim() || "—"}
                        </p>
                      }
                    />
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {debriefing.text}
                  </p>
                )}

                <p className="pt-2 text-xs text-[var(--color-text-muted)]">
                  Erstellt am {formatDateTime(debriefing.created_at)}
                  {debriefing.users?.email ? ` von ${debriefing.users.email}` : ""}
                </p>
              </div>
            </DetailSection>
          ) : null}
        </div>

        <aside className="space-y-6">
          <DetailSection title="Interne Informationen">
            <div className="space-y-4">
              <DetailItem
                label="Event-ID"
                value={<span className="break-all">{event.id}</span>}
              />
              <DetailItem
                label="Erstellt von"
                value={<span className="break-all">{creatorEmail}</span>}
              />
              <DetailItem label="Department" value={creatorDepartment} />
              <DetailItem
                label="Erstellt am"
                value={formatDateTime(event.created_at)}
              />
            </div>
          </DetailSection>

          {hasLogs && (
            <DetailSection title="Letzte Änderungen">
              <AuditLogList logs={latestLogs} />

              {hasMoreLogs && (
                <details className="mt-4 group">
                  <summary className="cursor-pointer list-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]">
                    Weitere Änderungen anzeigen
                  </summary>

                  <div className="mt-4">
                    <AuditLogList logs={olderLogs} />
                  </div>
                </details>
              )}
            </DetailSection>
          )}
        </aside>
      </div>
    </div>
  );
}