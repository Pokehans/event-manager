import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  if (!currentUser) {
    redirect("/");
  }

  return (
    <DashboardShell userRole={currentUser.role}>
      {children}
    </DashboardShell>
  );
}