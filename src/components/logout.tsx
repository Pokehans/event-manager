"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  collapsed?: boolean;
};

export default function LogoutButton({ collapsed = false }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      title={collapsed ? "Logout" : undefined}
      className={`flex w-full items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)] ${
        collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
      }`}
    >
      <span>⎋</span>
      {!collapsed && <span className="text-sm font-semibold">Logout</span>}
    </button>
  );
}