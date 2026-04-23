import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/lib/auth/roles";

type GetCurrentUserOptions = {
  redirectTo?: string;
  requireActive?: boolean;
};

export async function getCurrentUser(
  options: GetCurrentUserOptions = {}
): Promise<AppUser | null> {
  const { redirectTo, requireActive = true } = options;

  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    if (redirectTo) redirect(redirectTo);
    return null;
  }

  const { data: dbUser, error } = await supabase
    .from("users")
    .select(
      "id, email, role, active, area, department, must_change_password, password_changed_at, created_at"
    )
    .eq("id", authUser.id)
    .single();

  if (error || !dbUser) {
    await supabase.auth.signOut();

    if (redirectTo) redirect(redirectTo);
    return null;
  }

  if (requireActive && !dbUser.active) {
    await supabase.auth.signOut();

    if (redirectTo) redirect(redirectTo);
    return null;
  }

  return dbUser as AppUser;
}

export async function requireRole(
  allowedRoles: UserRole[],
  redirectTo = "/dashboard"
) {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectTo);
  }

  return user;
}