"use client";

import { useState } from "react";
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

function getInitialRememberedEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

export default function LoginForm({
  reason,
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState(getInitialRememberedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(
    () => getInitialRememberedEmail() !== ""
  );

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Bitte E-Mail und Passwort eingeben");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login fehlgeschlagen");
      setLoading(false);
      return;
    }

    if (rememberEmail) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleLogin();
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

            <h1 className="page-title text-[2rem]">Login</h1>
            <p className="page-subtitle">
              Melde dich mit deinen Zugangsdaten an.
            </p>
          </div>

          {reason === "session-timeout" ? (
            <div className="mb-5 rounded-xl border border-[var(--color-warning)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-text)] shadow-sm">
              Deine Sitzung wurde wegen Inaktivität beendet. Bitte erneut
              anmelden.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              placeholder="name@firma.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Passwort"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span>E-Mail merken</span>
            </label>

            <Button fullWidth type="submit" disabled={loading}>
              {loading ? "Lade..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}