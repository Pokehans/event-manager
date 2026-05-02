"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

export default function SidebarLink({
  href,
  label,
  icon,
  active,
  collapsed = false,
  onClick,
}: SidebarLinkProps) {
  const pathname = usePathname();

  const isActive = active ?? pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        collapsed ? "justify-center" : "gap-3"
      } ${
        isActive
          ? "bg-[var(--color-primary)] !text-white shadow-sm"
          : "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}