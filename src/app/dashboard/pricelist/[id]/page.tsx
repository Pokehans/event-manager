import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import { getOfferItemById } from "@/lib/offers/get-offer-items";
import {
  updateOfferItemDescription,
  updateOfferItemPrice,
  updateOfferItemStatus,
} from "./actions";
import {
  EditableDescriptionSection,
  EditableDetailField,
  StatusToggle,
} from "./editable-detail-field";

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

function getUnitLabel(unit: string | null) {
  switch (unit) {
    case "person":
      return "pro Person";
    case "portion":
      return "pro Portion";
    case "piece":
      return "pro Stück";
    case "bottle":
      return "Flasche";
    default:
      return unit || "—";
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

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[160px_1fr] sm:items-center">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="text-sm text-[var(--color-text)]">{value}</div>
    </div>
  );
}

type DetailSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

function DetailSection({
  title,
  description,
  action,
  children,
}: DetailSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-text">{description}</p> : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
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

  const canEditOfferItem = currentUser
    ? hasRole(currentUser.role, [ROLES.EDITOR, ROLES.ADMIN, ROLES.SYSTEMADMIN])
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
            <div>
                <DetailRow
                label="Kategorie"
                value={getCategoryLabel(item.category_path) || "Ohne Kategorie"}
                />

                <DetailRow
                label="Preis"
                value={
                    <EditableDetailField
                    value={formatPrice(item.price)}
                    name="price"
                    initialValue={item.price}
                    formAction={updateOfferItemPrice.bind(null, item.id)}
                    canEdit={canEditOfferItem}
                    inputMode="decimal"
                    />
                }
                />

                <DetailRow label="Einheit / Größe" value={getUnitLabel(item.unit)} />

                <DetailRow label="Typ" value={getTypeLabel(item.item_type)} />

                <DetailRow
                  label="Status"
                  value={
                    <StatusToggle
                      initialValue={item.is_active}
                      formAction={updateOfferItemStatus.bind(null, item.id)}
                      canEdit={canEditOfferItem}
                    />
                  }
                />
            </div>
        </DetailSection>

         <EditableDescriptionSection
            initialValue={item.description ?? ""}
            formAction={updateOfferItemDescription.bind(null, item.id)}
            canEdit={canEditOfferItem}
          />
        </div>

        <div className="space-y-6">
          <DetailSection title="Interne Informationen">
            <div className="grid gap-4">
              <DetailItem label="Produkt-ID" value={item.id} />
              <DetailItem label="Kategorie-ID" value={item.category?.id ?? "—"} />
              <DetailItem label="Erstellt am" value={formatDateTime(item.created_at)} />
              <DetailItem
                label="Zuletzt geändert"
                value={formatDateTime(item.updated_at)}
              />
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