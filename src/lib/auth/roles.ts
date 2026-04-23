export const ROLES = {
  READER: "reader",
  EDITOR: "editor",
  ADMIN: "admin",
  SYSTEMADMIN: "systemadmin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  active: boolean;
  area: string | null;
  department: string | null;
  must_change_password: boolean;
  password_changed_at: string | null;
  created_at?: string;
};

export function hasRole(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}