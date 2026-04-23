"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

type ChangePasswordFormProps = {
  email: string;
  userId: string;
  mode?: "standard" | "first-login";
};

function isStrongEnough(password: string) {
  return password.trim().length >= 8;
}

export default function ChangePasswordForm({
  email,
  userId,
  mode = "standard",
}: ChangePasswordFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const isFirstLoginMode = mode === "first-login";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setFormError("");
    setFormSuccess("");
  }

  function validate() {
    let valid = true;

    if (!isFirstLoginMode && !currentPassword.trim()) {
      setCurrentPasswordError("Bitte gib dein aktuelles Passwort ein.");
      valid = false;
    }

    if (!isStrongEnough(newPassword)) {
      setNewPasswordError("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
      valid = false;
    }

    if (!isFirstLoginMode && newPassword === currentPassword && newPassword.trim() !== "") {
      setNewPasswordError("Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.");
      valid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Bitte bestätige dein neues Passwort.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Die Passwörter stimmen nicht überein.");
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!validate()) {
      return;
    }

    setLoading(true);

    if (!isFirstLoginMode) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        setFormError("Das aktuelle Passwort ist nicht korrekt.");
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setFormError(
        "Das Passwort konnte nicht aktualisiert werden. Bitte versuche es erneut."
      );
      setLoading(false);
      return;
    }

    const updatePayload = isFirstLoginMode
      ? {
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        }
      : {
          password_changed_at: new Date().toISOString(),
        };

    const { error: dbError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId);

    if (dbError) {
      setFormError(
        "Das Passwort wurde geändert, aber der Benutzerstatus konnte nicht aktualisiert werden. Bitte kontaktiere einen Admin."
      );
      setLoading(false);
      return;
    }

    if (isFirstLoginMode) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setFormSuccess("Dein Passwort wurde erfolgreich geändert.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <Card
      title={isFirstLoginMode ? "Initialpasswort ändern" : "Passwort ändern"}
      description={
        isFirstLoginMode
          ? "Beim ersten Login musst du dein Initialpasswort durch ein persönliches Passwort ersetzen."
          : "Ändere dein Passwort direkt in deinem Benutzerprofil."
      }
    >
      {formError ? (
        <div className="mb-5 rounded-xl border border-[rgba(192,57,43,0.35)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-danger)] shadow-sm">
          {formError}
        </div>
      ) : null}

      {formSuccess ? (
        <div className="mb-5 rounded-xl border border-[rgba(39,174,96,0.35)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-success)] shadow-sm">
          {formSuccess}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isFirstLoginMode ? (
          <Input
            id="current-password"
            name="current-password"
            label="Aktuelles Passwort"
            type="password"
            placeholder="Aktuelles Passwort"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (currentPasswordError) setCurrentPasswordError("");
              if (formError) setFormError("");
              if (formSuccess) setFormSuccess("");
            }}
            error={currentPasswordError}
            autoComplete="current-password"
            required
          />
        ) : null}

        <Input
          id="new-password"
          name="new-password"
          label="Neues Passwort"
          type="password"
          placeholder="Mindestens 8 Zeichen"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (newPasswordError) setNewPasswordError("");
            if (formError) setFormError("");
            if (formSuccess) setFormSuccess("");
          }}
          error={newPasswordError}
          hint="Verwende aus Sicherheitsgründen ein neues Passwort."
          autoComplete="new-password"
          required
        />

        <Input
          id="confirm-new-password"
          name="confirm-new-password"
          label="Neues Passwort bestätigen"
          type="password"
          placeholder="Neues Passwort wiederholen"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmPasswordError) setConfirmPasswordError("");
            if (formError) setFormError("");
            if (formSuccess) setFormSuccess("");
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
  );
}