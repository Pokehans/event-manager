import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { getOfferCategories } from "@/lib/offers/get-offer-items";
import { OfferItemForm } from "./offer-item-form";

export default async function NewPricelistItemPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canCreateOfferItem = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!canCreateOfferItem) {
    redirect("/dashboard/pricelist");
  }

  const categories = await getOfferCategories();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="page-title">Position erstellen</h1>
          <p className="page-subtitle">
            Neue Preislistenposition erfassen.
          </p>
        </div>

        <Link
          href="/dashboard/pricelist"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
        >
          Zurück zur Preisliste
        </Link>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="section-title">Stammdaten</h2>
            <div className="mt-6">
                <OfferItemForm categories={categories} />
            </div>
      </section>
    </div>
  );
}