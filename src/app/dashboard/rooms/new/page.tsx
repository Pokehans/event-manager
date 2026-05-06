import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { RoomForm } from "./room-form";

export default async function NewRoomPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  if (!currentUser || !hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])) {
    redirect("/dashboard/rooms");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            Raum erstellen
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Neuen Raum mit Kapazität, Nutzung und Status erfassen
          </p>
        </div>

        <Link
          href="/dashboard/rooms"
          className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
        >
          Zurück zur Raumverwaltung
        </Link>
      </div>

      <RoomForm />
    </div>
  );
}