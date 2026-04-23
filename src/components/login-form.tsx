"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

const REMEMBER_EMAIL_KEY = "event-manager-remember-email";

type LoginFormProps = {
  reason?: string;
};

type FormMode = "login" | "forgot-password";

function getInitialRememberedEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginForm({ reason }: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState(getInitialRememberedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(
    () => getInitialRememberedEmail() !== ""
  );

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const title = useMemo(() => {
    return mode === "login" ? "Login" : "Passwort zurücksetzen";
  }, [mode]);

  const subtitle = useMemo(() => {
    return mode === "login"
      ? "Melde dich mit deinen Zugangsdaten an."
      : "Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.";
  }, [mode]);

  function resetMessages() {
    setFormError("");
    setFormSuccess("");
    setEmailError("");
    setPasswordError("");
  }

  function validateLogin() {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Bitte gib deine E-Mail-Adresse ein.");
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Bitte gib dein Passwort ein.");
      valid = false;
    }

    return valid;
  }

  function validateForgotPassword() {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Bitte gib deine E-Mail-Adresse ein.");
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
      valid = false;
    }

    return valid;
  }

  const handleLogin = async () => {
    resetMessages();

    if (!validateLogin()) {
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setFormError("Login fehlgeschlagen. Bitte prüfe deine E-Mail und dein Passwort.");
      setLoading(false);
      return;
    }

    if (rememberEmail) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
    } else {
      window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleForgotPassword = async () => {
    resetMessages();

    if (!validateForgotPassword()) {
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setFormError(
        "Die Reset-Mail konnte nicht gesendet werden. Bitte versuche es erneut."
      );
      setLoading(false);
      return;
    }

    setFormSuccess(
      "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine Passwort-Reset-Mail versendet."
    );
    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      await handleLogin();
      return;
    }

    await handleForgotPassword();
  };

  const switchToForgotPassword = () => {
    setMode("forgot-password");
    setPassword("");
    resetMessages();
  };

  const switchToLogin = () => {
    setMode("login");
    resetMessages();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Event Manager Logo"
                width={141}
                height={44}
              />
              <div>
                <div className="inline-flex rounded-full bg-[rgba(26,103,123,0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  Event Manager
                </div>
              </div>
            </div>

            <h1 className="page-title text-[2rem]">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>

          {reason === "session-timeout" ? (
            <div className="mb-5 rounded-xl border border-[var(--color-warning)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text)] shadow-sm">
              Deine Sitzung wurde wegen Inaktivität beendet. Bitte erneut anmelden.
            </div>
          ) : null}

          {reason === "password-updated" ? (
            <div className="mb-5 rounded-xl border border-[rgba(39,174,96,0.35)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text)] shadow-sm">
              Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.
            </div>
          ) : null}

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
            <Input
              id="email"
              name="email"
              label="E-Mail"
              type="email"
              placeholder="name@firma.ch"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError("");
                }
                if (formError) {
                  setFormError("");
                }
                if (formSuccess) {
                  setFormSuccess("");
                }
              }}
              error={emailError}
              autoComplete="email"
              required
            />

            {mode === "login" ? (
              <Input
                id="password"
                name="password"
                label="Passwort"
                type="password"
                placeholder="Passwort"
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
                autoComplete="current-password"
                required
              />
            ) : null}

            {mode === "login" ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>E-Mail merken</span>
                  </label>

                  <button
                    type="button"
                    onClick={switchToForgotPassword}
                    className="text-sm font-medium text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
                  >
                    Passwort vergessen?
                  </button>
                </div>

                <Button fullWidth type="submit" disabled={loading}>
                  {loading ? "Lade..." : "Login"}
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth type="submit" disabled={loading}>
                  {loading ? "Sende..." : "Reset-Link senden"}
                </Button>

                <Button
                  fullWidth
                  type="button"
                  variant="secondary"
                  onClick={switchToLogin}
                  disabled={loading}
                >
                  Zurück zum Login
                </Button>
              </>
            )}
          </form>
        </Card>
      </div>
    </main>
  );
}