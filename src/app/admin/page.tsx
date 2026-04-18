import { requireRole } from "@/lib/auth/get-current-user";
import { ROLES } from "@/lib/auth/roles";

export default async function AdminPage() {
  const user = await requireRole([
    ROLES.ADMIN,
    ROLES.SYSTEMADMIN,
  ]);

  if (!user) return null;

  return (
    <main className="p-8 text-white">
      <h1 className="text-2xl font-bold">Admin Bereich</h1>
      <p>Nur Admin und Systemadmin sehen das</p>
    </main>
  );
}