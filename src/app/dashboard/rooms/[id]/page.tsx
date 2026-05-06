import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { RoomImageUpload } from "./images/room-image-upload";
import { DeleteRoomImageButton } from "./images/delete-room-image-button";

type Room = {
  id: string;
  name: string;
  capacity: number | null;
  function_description: string | null;
  status: string;
  equipment: string[] | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  users:
    | {
        id: string;
        email: string | null;
      }
    | {
        id: string;
        email: string | null;
      }[]
    | null;
};

type RoomLog = {
  id: string;
  change: string;
  created_at: string | null;
  users:
    | {
        id: string;
        email: string | null;
      }
    | null;
};

type RoomImage = {
  id: string;
  room_id: string;
  file_path: string;
  file_name: string;
  alt_text: string | null;
  sort_order: number | null;
  created_at: string;
  signedUrl: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Aktiv";
    case "inactive":
      return "Inaktiv";
    case "blocked":
      return "Gesperrt";
    default:
      return status;
  }
}

function formatDateTime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("de-CH");
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
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

function AuditLogList({ logs }: { logs: RoomLog[] }) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
        >
          <p className="text-sm font-medium">
            {log.change.includes("Neu:") ? (
              <>
                {log.change.split("Neu:")[0]}
                <span className="font-bold">
                  Neu:{log.change.split("Neu:")[1]}
                </span>
              </>
            ) : (
              log.change
            )}
          </p>

          <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
            <p>{formatDateTime(log.created_at)}</p>
            <p>{getLogUserLabel(log.users?.email ?? null)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser({ redirectTo: "/" });
  const supabase = await createClient();

  const canManageRooms = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  const { data: room, error } = await supabase
    .from("rooms")
    .select(`
        *,
        users:created_by (
            id,
            email
        )
     `)
    .eq("id", id)
    .single();

  if (error || !room) {
    notFound();
  }

  const { data: logs } = await supabase
    .from("room_logs")
    .select(`
      id,
      change,
      created_at,
      users:user_id (
        id,
        email
      )
    `)
    .eq("room_id", id)
    .order("created_at", { ascending: false });

  const { data: images } = await supabase
    .from("room_images")
    .select("id, room_id, file_path, file_name, alt_text, sort_order, created_at")
    .eq("room_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const roomImages: RoomImage[] = await Promise.all(
    (images ?? []).map(async (image) => {
      const { data } = await supabase.storage
        .from("room-images")
        .createSignedUrl(image.file_path, 60 * 60);

      return {
        ...image,
        signedUrl: data?.signedUrl ?? null,
      };
    })
  );

  const r = room as Room;
  const createdByUser = pickOne(r.users);
  const roomLogs: RoomLog[] = (logs ?? []).map((log) => ({
    ...log,
    users: pickOne(log.users),
    }));
  const latestLogs = roomLogs.slice(0, 3);
  const hasLogs = roomLogs.length > 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="page-title">{r.name}</h1>
          <p className="page-subtitle">Detailansicht</p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/rooms"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
              Zurück zur Raumverwaltung
            </Link>

            {canManageRooms ? (
              <Link
                href={`/dashboard/rooms/${r.id}/edit`}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
              >
                Bearbeiten
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailSection title="Basisdaten">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Name" value={r.name} />
              <DetailItem
                label="Status"
                value={<StatusBadge label={getStatusLabel(r.status)} />}
              />
              <DetailItem
                label="Kapazität"
                value={r.capacity ? `${r.capacity} Personen` : "—"}
              />
            </div>
          </DetailSection>

          <DetailSection title="Funktion / Nutzung">
            <p className="whitespace-pre-wrap text-sm leading-6">
              {r.function_description || "—"}
            </p>
          </DetailSection>

          <DetailSection title="Ausstattung">
            {r.equipment?.length ? (
              <div className="flex flex-wrap gap-2">
                {r.equipment.map((item) => (
                  <span
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="section-text">Keine Ausstattung erfasst.</p>
            )}
          </DetailSection>

          <DetailSection title="Interne Notizen">
            <p className="whitespace-pre-wrap text-sm leading-6">
              {r.internal_notes || "Keine internen Notizen erfasst."}
            </p>
          </DetailSection>

          <DetailSection
            title="Bilder"
            description="Bilder des Raums für Planung, Verkauf und interne Orientierung."
          >
            <div className="space-y-6">
              {canManageRooms ? <RoomImageUpload roomId={r.id} /> : null}

              {roomImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {roomImages.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                    >
                      {image.signedUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.signedUrl}
                            alt={image.alt_text || image.file_name}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-white text-sm text-[var(--color-text-muted)]">
                          Bild konnte nicht geladen werden.
                        </div>
                      )}

                      <div className="space-y-3 p-3">
                        <p className="truncate text-sm font-medium">{image.file_name}</p>

                        {canManageRooms ? (
                          <DeleteRoomImageButton
                            roomId={r.id}
                            imageId={image.id}
                            filePath={image.file_path}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="section-text">Noch keine Bilder erfasst.</p>
              )}
            </div>
          </DetailSection>

          <DetailSection title="Dokumente">
            <p className="section-text">
              Dokumente wie Bestuhlungspläne werden im nächsten Schritt ergänzt.
            </p>
          </DetailSection>
        </div>

        <div className="space-y-6">
            <DetailSection title="Interne Informationen">
                <div className="grid gap-4">
                <DetailItem label="Raum-ID" value={r.id} />

                <DetailItem
                    label="Erstellt von"
                    value={createdByUser?.email || "Unbekannt"}
                />

                <DetailItem
                    label="Erstellt am"
                    value={formatDateTime(r.created_at)}
                />
                </div>
            </DetailSection>

            <DetailSection title="Änderungsverlauf">
                {hasLogs ? (
                <AuditLogList logs={latestLogs} />
                ) : (
                <p className="section-text">Noch keine Änderungen erfasst.</p>
                )}
            </DetailSection>
            </div>
      </div>
    </div>
  );
}