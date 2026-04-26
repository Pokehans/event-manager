"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import SidebarLink from "@/components/ui/sidebar-link";
import LogoutButton from "@/components/logout";
import { ROLES, hasRole, type UserRole } from "@/lib/auth/roles";
import SessionTimeoutGuard from "@/components/auth/session-timeout-guard";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SIDEBAR_STORAGE_KEY = "dashboard-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "dashboard-sidebar-storage-change";

function subscribeSidebarPreference(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomEvent = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, handleCustomEvent);
  };
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getSidebarServerSnapshot() {
  return false;
}

function setSidebarStoredValue(value: boolean) {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M3 13h8V3H3v10Z" />
      <path d="M13 21h8V11h-8v10Z" />
      <path d="M13 3h8v6h-8V3Z" />
      <path d="M3 21h8v-6H3v6Z" />
    </svg>
  );
}

function CockpitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-3 3 2 5-6" />
      <path d="M18 8h1v1" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function EventListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M4 20V8l8-5 8 5v12" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

type DashboardShellProps = {
  children: React.ReactNode;
  userRole: UserRole;
};

export default function DashboardShell({
  children,
  userRole,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const [passwordGuardChecked, setPasswordGuardChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkPasswordChangeRequirement() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) {
          setPasswordGuardChecked(true);
        }
        router.replace("/");
        return;
      }

      const { data: dbUser, error } = await supabase
        .from("users")
        .select("must_change_password")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (error || !dbUser) {
        setPasswordGuardChecked(true);
        router.replace("/");
        return;
      }

      if (
        dbUser.must_change_password &&
        pathname !== "/dashboard/force-password-change"
      ) {
        router.replace("/dashboard/force-password-change");
        return;
      }

      if (
        !dbUser.must_change_password &&
        pathname === "/dashboard/force-password-change"
      ) {
        router.replace("/dashboard");
        return;
      }

      setPasswordGuardChecked(true);
    }

    void checkPasswordChangeRequirement();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarPreference,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );

  const toggleSidebarCollapsed = () => {
    setSidebarStoredValue(!sidebarCollapsed);
  };

  const canCreateEvent = hasRole(userRole, [
    ROLES.EDITOR,
    ROLES.ADMIN,
    ROLES.SYSTEMADMIN,
  ]);

  if (!passwordGuardChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-4 text-sm font-medium text-[var(--color-text-muted)] shadow-sm">
          Benutzerstatus wird geprüft...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <SessionTimeoutGuard />
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside
          className={`hidden border-r border-[var(--color-border)] bg-white transition-all duration-300 xl:flex xl:flex-col ${
            sidebarCollapsed ? "w-24" : "w-72"
          }`}
        >
          <div className="border-b border-[var(--color-border)] px-4 py-5">
            <div
              className={`flex ${
                sidebarCollapsed
                  ? "flex-col items-center gap-3"
                  : "items-center gap-3"
              }`}
            >
              <Image
                src="/logo.png"
                alt="Event Manager Logo"
                width={128}
                height={40}
                priority
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div>
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                title={
                  sidebarCollapsed
                    ? "Sidebar erweitern"
                    : "Sidebar einklappen"
                }
                className={`mb-3 inline-flex h-10 items-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:bg-[var(--color-surface-muted)] ${
                  sidebarCollapsed ? "w-full justify-center" : "gap-2 px-3"
                }`}
                aria-label={
                  sidebarCollapsed
                    ? "Sidebar erweitern"
                    : "Sidebar einklappen"
                }
              >
                <span className="text-lg leading-none">
                  {sidebarCollapsed ? "→" : "←"}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-semibold">Navigation</span>
                )}
              </button>

              <nav className="space-y-2">
                <SidebarLink
                  href="/dashboard"
                  label="Dashboard"
                  icon={<DashboardIcon />}
                  collapsed={sidebarCollapsed}
                />
                <SidebarLink
                  href="/dashboard/cockpit"
                  label="Cockpit"
                  icon={<CockpitIcon />}
                  collapsed={sidebarCollapsed}
                />
                {canCreateEvent ? (
                  <SidebarLink
                    href="/dashboard/events/new"
                    label="Event erstellen"
                    icon={<EventsIcon />}
                    collapsed={sidebarCollapsed}
                  />
                ) : null}
                <SidebarLink
                  href="/dashboard/events"
                  label="Eventliste"
                  icon={<EventListIcon />}
                  collapsed={sidebarCollapsed}
                />
                <SidebarLink
                  href="#"
                  label="Archiv"
                  icon={<ArchiveIcon />}
                  collapsed={sidebarCollapsed}
                />
                <SidebarLink
                  href="/dashboard/profile"
                  label="Profil"
                  icon={<ProfileIcon />}
                  collapsed={sidebarCollapsed}
                />
                <SidebarLink
                  href="#"
                  label="Räume"
                  icon={<RoomsIcon />}
                  collapsed={sidebarCollapsed}
                />
                <SidebarLink
                  href="#"
                  label="Benutzer"
                  icon={<UsersIcon />}
                  collapsed={sidebarCollapsed}
                />
              </nav>
            </div>

            <div className="mt-auto pt-4">
              <LogoutButton collapsed={sidebarCollapsed} />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white xl:hidden">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Event Manager Logo"
                  width={115}
                  height={36}
                  priority
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)]"
                aria-label="Menü öffnen"
                aria-expanded={mobileMenuOpen}
              >
                <span className="text-xl leading-none">
                  {mobileMenuOpen ? "✕" : "☰"}
                </span>
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="border-t border-[var(--color-border)] px-4 py-4 md:px-6">
                <nav className="space-y-2">
                  <SidebarLink
                    href="/dashboard"
                    label="Dashboard"
                    icon={<DashboardIcon />}
                  />
                  <SidebarLink
                    href="/dashboard/cockpit"
                    label="Cockpit"
                    icon={<CockpitIcon />}
                  />
                  {canCreateEvent ? (
                    <SidebarLink
                      href="/dashboard/events/new"
                      label="Event erstellen"
                      icon={<EventsIcon />}
                    />
                  ) : null}
                  <SidebarLink
                    href="/dashboard/events"
                    label="Eventliste"
                    icon={<EventListIcon />}
                  />
                  <SidebarLink
                    href="#"
                    label="Archiv"
                    icon={<ArchiveIcon />}
                  />
                  <SidebarLink
                    href="/dashboard/profile"
                    label="Profil"
                    icon={<ProfileIcon />}
                  />
                  <SidebarLink
                    href="#"
                    label="Räume"
                    icon={<RoomsIcon />}
                  />
                  <SidebarLink
                    href="#"
                    label="Benutzer"
                    icon={<UsersIcon />}
                  />
                </nav>

                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                  <LogoutButton />
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}