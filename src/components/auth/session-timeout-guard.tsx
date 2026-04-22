"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SESSION_TIMEOUT_MS } from "@/lib/config/session";

type SessionTimeoutGuardProps = {
  timeoutMs?: number;
};

export default function SessionTimeoutGuard({
  timeoutMs = DEFAULT_SESSION_TIMEOUT_MS,
}: SessionTimeoutGuardProps) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSigningOutRef = useRef(false);

  const clearExistingTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const signOutDueToInactivity = useCallback(async () => {
    if (isSigningOutRef.current) {
      return;
    }

    isSigningOutRef.current = true;
    clearExistingTimer();

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace("/?reason=session-timeout");
    router.refresh();
  }, [clearExistingTimer, router]);

  const resetTimer = useCallback(() => {
    if (isSigningOutRef.current) {
      return;
    }

    clearExistingTimer();

    timeoutRef.current = setTimeout(() => {
      void signOutDueToInactivity();
    }, timeoutMs);
  }, [clearExistingTimer, signOutDueToInactivity, timeoutMs]);

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
      resetTimer();
    };

    resetTimer();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearExistingTimer();

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearExistingTimer, resetTimer]);

  return null;
}