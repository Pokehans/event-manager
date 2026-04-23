import Card from "@/components/ui/card";
import ChangePasswordForm from "@/components/profile/change-password-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";

function formatRole(role: string) {
  switch (role) {
    case "reader":
      return "Reader";
    case "editor":
      return "Editor";
    case "admin":
      return "Admin";
    case "systemadmin":
      return "Systemadmin";
    default:
      return role;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export default async function ProfilePage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="page-title">Mein Profil</h1>
        <p className="page-subtitle">
          Benutzerdaten und Passwort.
        </p>
      </div>

      <Card
        title="Benutzerinformationen"
        description="Diese Angaben stammen aus deinem Benutzerkonto."
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              E-Mail
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {user.email}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              Rolle
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {formatRole(user.role)}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              Bereich
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {user.area ?? "—"}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              Abteilung
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {user.department ?? "—"}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              Status
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {user.active ? "Aktiv" : "Inaktiv"}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              Erstellt am
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {formatDate(user.created_at)}
            </dd>
          </div>
        </dl>
      </Card>

      <ChangePasswordForm email={user.email} userId={user.id} />
    </div>
  );
}