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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary)]">
            Position erstellen
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Neue Preislistenposition mit Kategorie, Preis und Einheit erfassen
          </p>
        </div>

        <Link
          href="/dashboard/pricelist"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
        >
          Zurück zur Preisliste
        </Link>
      </div>
    <OfferItemForm categories={categories} />
    </div>
  );
}