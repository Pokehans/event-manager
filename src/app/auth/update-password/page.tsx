"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

function isStrongEnough(password: string) {
  return password.trim().length >= 8;
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");
    setFormError("");

    let valid = true;

    if (!isStrongEnough(password)) {
      setPasswordError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      valid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Bitte bestätige dein neues Passwort.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Die Passwörter stimmen nicht überein.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setFormError(
        "Das Passwort konnte nicht aktualisiert werden. Bitte öffne den Link aus der E-Mail erneut."
      );
      setLoading(false);
      return;
    }

    router.push("/?reason=password-updated");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8">
            <h1 className="page-title text-[2rem]">Neues Passwort setzen</h1>
            <p className="page-subtitle">
              Vergib ein neues Passwort für dein Konto.
            </p>
          </div>

          {formError ? (
            <div className="mb-5 rounded-xl border border-[rgba(192,57,43,0.35)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-danger)] shadow-sm">
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="new-password"
              name="new-password"
              label="Neues Passwort"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) {
                  setPasswordError("");
                }
                if (formError) {
                  setFormError("");
                }
              }}
              error={passwordError}
              autoComplete="new-password"
              required
            />

            <Input
              id="confirm-password"
              name="confirm-password"
              label="Passwort bestätigen"
              type="password"
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) {
                  setConfirmPasswordError("");
                }
                if (formError) {
                  setFormError("");
                }
              }}
              error={confirmPasswordError}
              autoComplete="new-password"
              required
            />

            <Button fullWidth type="submit" disabled={loading}>
              {loading ? "Speichere..." : "Passwort aktualisieren"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}