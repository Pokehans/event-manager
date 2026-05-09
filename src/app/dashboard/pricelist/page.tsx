import Card from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOfferItems, type OfferItem } from "@/lib/offers/get-offer-items";

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(price);
}

function getUnitLabel(unit: string) {
  switch (unit) {
    case "person":
      return "pro Person";
    case "piece":
      return "pro Stück";
    case "portion":
      return "pro Portion";
    case "bottle":
      return "pro Flasche";
    case "liter":
      return "pro Liter";
    case "day":
      return "pro Tag";
    case "half_day":
      return "pro Halbtag";
    case "flat":
      return "pauschal";
    default:
      return unit;
  }
}

function getMainCategory(item: OfferItem) {
  const category = item.category;

  if (!category) return "Ohne Kategorie";

  if (category.parent?.name === "Hauptgänge") return "Food";
  if (category.parent?.name === "Beilagen") return "Food";

  return category.parent?.name ?? category.name;
}

function getSubCategory(item: OfferItem) {
  const category = item.category;

  if (!category) return "Ohne Kategorie";

  if (category.parent?.name === "Hauptgänge") {
    return `Hauptgänge / ${category.name}`;
  }

  if (category.parent?.name === "Beilagen") {
    return `Beilagen / ${category.name}`;
  }

  return category.parent ? category.name : "Allgemein";
}

export default async function PricelistPage() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  if (!currentUser) return null;

  const items = await getOfferItems();

  const groupedByMainCategory = items.reduce<
    Record<string, Record<string, OfferItem[]>>
  >((groups, item) => {
    const mainCategory = getMainCategory(item);
    const subCategory = getSubCategory(item);

    if (!groups[mainCategory]) {
      groups[mainCategory] = {};
    }

    if (!groups[mainCategory][subCategory]) {
      groups[mainCategory][subCategory] = [];
    }

    groups[mainCategory][subCategory].push(item);

    return groups;
  }, {});

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="page-title">Preisliste</h1>
          <p className="page-subtitle">
            Strukturierte Übersicht aller Angebotspositionen für Food,
            Getränke, Seminare, Räume, Technik und Extras.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold text-[var(--color-text)]">
            {items.length}
          </span>{" "}
          <span className="text-[var(--color-text-muted)]">
            Positionen erfasst
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="section-text">
            Es sind noch keine Angebotspositionen erfasst.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMainCategory).map(
            ([mainCategory, subCategories]) => (
              <Card
                key={mainCategory}
                title={mainCategory}
                description="Gruppierte Angebotspositionen mit Preis und Einheit."
              >
                <div className="space-y-5">
                  {Object.entries(subCategories).map(
                    ([subCategory, groupItems]) => (
                      <section key={subCategory} className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            {subCategory}
                          </h3>
                          <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                            {groupItems.length} Positionen
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                          <div className="hidden md:block">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                                <tr>
                                  <th className="px-4 py-3 font-semibold">
                                    Position
                                  </th>
                                  <th className="px-4 py-3 font-semibold">
                                    Typ
                                  </th>
                                  <th className="px-4 py-3 font-semibold">
                                    Einheit
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    Preis
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-border)] bg-white">
                                {groupItems.map((item) => (
                                  <tr
                                    key={item.id}
                                    className="hover:bg-[var(--color-surface-muted)]/60"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="font-semibold text-[var(--color-text)]">
                                        {item.name}
                                      </div>
                                      {item.description ? (
                                        <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                                          {item.description}
                                        </div>
                                      ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                                      {item.item_type === "package"
                                        ? "Paket"
                                        : "Position"}
                                    </td>
                                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                                      {getUnitLabel(item.unit)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                                      {formatPrice(item.price)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="divide-y divide-[var(--color-border)] bg-white md:hidden">
                            {groupItems.map((item) => (
                              <div key={item.id} className="space-y-2 p-4">
                                <div>
                                  <p className="font-semibold text-[var(--color-text)]">
                                    {item.name}
                                  </p>
                                  {item.description ? (
                                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                      {item.description}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                  <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1">
                                    {item.item_type === "package"
                                      ? "Paket"
                                      : "Position"}
                                  </span>
                                  <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1">
                                    {getUnitLabel(item.unit)}
                                  </span>
                                </div>

                                <p className="text-base font-semibold text-[var(--color-text)]">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )
                  )}
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}