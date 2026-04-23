import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import ChangePasswordForm from "@/components/profile/change-password-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function ForcePasswordChangePage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  if (!user.must_change_password) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="page-title">Passwortänderung erforderlich</h1>
        <p className="page-subtitle">
          Beim ersten Login musst du dein Initialpasswort aus Sicherheitsgründen ändern,
          bevor du das System nutzen kannst.
        </p>
      </div>

      <Card
        title="Sicherheitshinweis"
        description="Dieser Schritt ist obligatorisch und wird vom System beim ersten Login verlangt."
      >
        <p className="section-text">
          Bitte vergib jetzt ein persönliches Passwort. Erst danach erhältst du Zugriff
          auf das Dashboard und weitere Funktionen.
        </p>
      </Card>

      <ChangePasswordForm
        email={user.email}
        userId={user.id}
        mode="first-login"
      />
    </div>
  );
}