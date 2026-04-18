"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

    router.push("/dashboard");
    router.refresh();
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

          <div className="space-y-4">
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

            <Button fullWidth onClick={handleLogin} disabled={loading}>
              {loading ? "Lade..." : "Login"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}