"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SESSION_TIMEOUT_MS } from "@/lib/config/session";

type SessionTimeoutGuardProps = {
  timeoutMs?: number;
};

const WARNING_DURATION_MS = 60 * 1000;

export default function SessionTimeoutGuard({
  timeoutMs = DEFAULT_SESSION_TIMEOUT_MS,
}: SessionTimeoutGuardProps) {
  const router = useRouter();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSigningOutRef = useRef(false);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const signOutNow = useCallback(async () => {
    if (isSigningOutRef.current) {
      return;
    }

    isSigningOutRef.current = true;
    clearTimers();

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace("/?reason=session-timeout");
    router.refresh();
  }, [clearTimers, router]);

  const startWarningCountdown = useCallback(() => {
    clearTimers();
    setShowWarning(true);
    setSecondsLeft(60);

    warningIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          void signOutNow();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, [clearTimers, signOutNow]);

  const startMainTimer = useCallback(() => {
    if (isSigningOutRef.current) {
      return;
    }

    clearTimers();

    timeoutRef.current = setTimeout(() => {
      startWarningCountdown();
    }, timeoutMs - WARNING_DURATION_MS);
  }, [clearTimers, startWarningCountdown, timeoutMs]);

  const extendSession = useCallback(() => {
    if (isSigningOutRef.current) {
      return;
    }

    setShowWarning(false);
    setSecondsLeft(60);
    startMainTimer();
  }, [startMainTimer]);

  useEffect(() => {
    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      if (showWarning) {
        extendSession();
        return;
      }

      startMainTimer();
    };

    startMainTimer();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [clearTimers, extendSession, showWarning, startMainTimer]);

  return showWarning ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-2xl">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Sitzung läuft bald ab
          </h2>

          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            Wegen Inaktivität wirst du in{" "}
            <span className="font-bold text-[var(--color-warning)]">
              {secondsLeft} Sekunden
            </span>{" "}
            automatisch abgemeldet.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={extendSession}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Sitzung verlängern
          </button>

          <button
            type="button"
            onClick={() => void signOutNow()}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Jetzt abmelden
          </button>
        </div>
      </div>
    </div>
  ) : null;
}