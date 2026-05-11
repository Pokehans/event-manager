import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { getOfferItemById } from "@/lib/offers/get-offer-items";

type Props = {
  params: Promise<{ id: string }>;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(price);
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("de-CH");
}

function getTypeLabel(type: string) {
  switch (type) {
    case "item":
      return "Position";
    case "package":
      return "Paket";
    default:
      return type;
  }
}

function getCategoryLabel(categoryPath: { name: string }[]) {
  return categoryPath.map((category) => category.name).join(" / ");
}

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

type DetailSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-text">{description}</p> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function PricelistItemDetailPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canOpenOfferItem = currentUser
    ? hasRole(currentUser.role, [ROLES.EDITOR, ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  const canDeleteOfferItem = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!canOpenOfferItem) {
    redirect("/dashboard/pricelist");
  }

  const item = await getOfferItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="page-title">{item.name}</h1>
          <p className="page-subtitle">Produktdetail</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/pricelist"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
          >
            Zurück zur Preisliste
          </Link>

          {canDeleteOfferItem ? (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 opacity-60"
              title="Löschen wird im nächsten Schritt integriert"
            >
              Löschen
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DetailSection title="Stammdaten">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Name" value={item.name} />

              <DetailItem
                label="Kategorie"
                value={getCategoryLabel(item.category_path) || "Ohne Kategorie"}
              />

              <DetailItem label="Preis" value={formatPrice(item.price)} />

              <DetailItem label="Einheit / Größe" value={item.unit || "—"} />

              <DetailItem label="Typ" value={getTypeLabel(item.item_type)} />

              <DetailItem
                label="Status"
                value={item.is_active ? "Aktiv" : "Inaktiv"}
              />
            </div>
          </DetailSection>

          <DetailSection title="Beschreibung">
            <p className="whitespace-pre-wrap text-sm leading-6">
              {item.description || "Keine Beschreibung erfasst."}
            </p>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Interne Informationen">
            <div className="grid gap-4">
              <DetailItem label="Produkt-ID" value={item.id} />
              <DetailItem
                label="Sortierung"
                value={String(item.sort_order ?? "—")}
              />
              <DetailItem label="Erstellt am" value={formatDateTime(null)} />
            </div>
          </DetailSection>

          <DetailSection title="Änderungsverlauf">
            <p className="section-text">
              Noch kein Änderungsverlauf für Preislistenpositionen erfasst.
            </p>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}