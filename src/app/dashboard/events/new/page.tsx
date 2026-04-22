import { redirect } from "next/navigation";
import { EventForm } from "./event-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

export default async function NewEventPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canCreate =
    currentUser &&
    hasRole(currentUser.role, [
      ROLES.EDITOR,
      ROLES.ADMIN,
      ROLES.SYSTEMADMIN,
    ]);

  if (!canCreate) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">Event erstellen</h1>
        <p className="page-subtitle">
          Neues Event erfassen und direkt im Kalender anzeigen.
        </p>
      </div>

      <EventForm />
    </div>
  );
}