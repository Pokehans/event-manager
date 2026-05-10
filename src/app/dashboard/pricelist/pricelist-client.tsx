"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/card";
import type { OfferItem } from "@/lib/offers/get-offer-items";
import { getUnitLabel } from "./utils";

type Props = {
  items: OfferItem[];
};

type TypeFilter = "all" | "item" | "package";

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(price);
}

function getCategoryLabel(item: OfferItem) {
  return item.category_path.map((category) => category.name).join(" / ");
}

export default function PricelistClient({ items }: Props) {
  const [search, setSearch] = useState("");
  const [mainCategoryFilter, setMainCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [detailCategoryFilter, setDetailCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mainCategories = useMemo(() => {
    const set = new Set<string>();

    items.forEach((item) => {
      const mainCategory = item.category_path[0]?.name;
      if (mainCategory) set.add(mainCategory);
    });

    return Array.from(set).sort();
  }, [items]);

  const subCategories = useMemo(() => {
    const set = new Set<string>();

    items.forEach((item) => {
      const mainCategory = item.category_path[0]?.name;
      const subCategory = item.category_path[1]?.name;

      if (
        subCategory &&
        (mainCategoryFilter === "all" || mainCategory === mainCategoryFilter)
      ) {
        set.add(subCategory);
      }
    });

    return Array.from(set).sort();
  }, [items, mainCategoryFilter]);

  const detailCategories = useMemo(() => {
    const set = new Set<string>();

    items.forEach((item) => {
      const mainCategory = item.category_path[0]?.name;
      const subCategory = item.category_path[1]?.name;
      const detailCategory = item.category_path[2]?.name;

      if (
        detailCategory &&
        (mainCategoryFilter === "all" || mainCategory === mainCategoryFilter) &&
        (subCategoryFilter === "all" || subCategory === subCategoryFilter)
      ) {
        set.add(detailCategory);
      }
    });

    return Array.from(set).sort();
  }, [items, mainCategoryFilter, subCategoryFilter]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchValue = search.trim().toLowerCase();
      const mainCategory = item.category_path[0]?.name;
      const subCategory = item.category_path[1]?.name;
      const detailCategory = item.category_path[2]?.name;

      if (searchValue && !item.name.toLowerCase().includes(searchValue)) {
        return false;
      }

      if (
        mainCategoryFilter !== "all" &&
        mainCategory !== mainCategoryFilter
      ) {
        return false;
      }

      if (subCategoryFilter !== "all" && subCategory !== subCategoryFilter) {
        return false;
      }

      if (
        detailCategoryFilter !== "all" &&
        detailCategory !== detailCategoryFilter
      ) {
        return false;
      }

      if (typeFilter !== "all" && item.item_type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [
    items,
    search,
    mainCategoryFilter,
    subCategoryFilter,
    detailCategoryFilter,
    typeFilter,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    mainCategoryFilter !== "all" ||
    subCategoryFilter !== "all" ||
    detailCategoryFilter !== "all" ||
    typeFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setMainCategoryFilter("all");
    setSubCategoryFilter("all");
    setDetailCategoryFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="page-title">Preisliste</h1>
        <p className="page-subtitle">
          Strukturierte Übersicht aller Angebotspositionen.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4 shadow-sm backdrop-blur lg:sticky lg:top-4 lg:z-20">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 lg:hidden">
            <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                Filter
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                {hasActiveFilters ? "Filter aktiv" : "Keine Filter aktiv"}
                </p>
            </div>

            <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            >
                {filtersOpen ? "Filter ausblenden" : "Filter anzeigen"}
            </button>
            </div>

            <div
                className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-4 lg:flex`}
                >
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Suche nach Position"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />

                <div className="grid gap-3 lg:grid-cols-4">
                    <select
                    value={mainCategoryFilter}
                    onChange={(event) => {
                        setMainCategoryFilter(event.target.value);
                        setSubCategoryFilter("all");
                        setDetailCategoryFilter("all");
                    }}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    >
                    <option value="all">Alle Kategorien</option>
                    {mainCategories.map((category) => (
                        <option key={category} value={category}>
                        {category}
                        </option>
                    ))}
                    </select>

                    <select
                    value={subCategoryFilter}
                    onChange={(event) => {
                        setSubCategoryFilter(event.target.value);
                        setDetailCategoryFilter("all");
                    }}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    >
                    <option value="all">Alle Unterkategorien</option>
                    {subCategories.map((category) => (
                        <option key={category} value={category}>
                        {category}
                        </option>
                    ))}
                    </select>

                    <select
                    value={detailCategoryFilter}
                    onChange={(event) => setDetailCategoryFilter(event.target.value)}
                    disabled={detailCategories.length === 0}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)]"
                    >
                    <option value="all">Alle Details</option>
                    {detailCategories.map((category) => (
                        <option key={category} value={category}>
                        {category}
                        </option>
                    ))}
                    </select>

                    <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    >
                    <option value="all">Alle Typen</option>
                    <option value="item">Position</option>
                    <option value="package">Paket</option>
                    </select>
                </div>
                </div>

            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
                {filteredItems.length} Position
                {filteredItems.length === 1 ? "" : "en"} gefunden
            </p>

            <button
                type="button"
                disabled={!hasActiveFilters}
                title={hasActiveFilters ? "Filter löschen" : "Keine Filter aktiv"}
                onClick={clearFilters}
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:hover:bg-[var(--color-border)] disabled:hover:text-[var(--color-text-muted)]"
            >
                Filter löschen
            </button>
            </div>
        </div>
        </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">Positionen</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {filteredItems.length} von {items.length}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <p className="section-text">Keine Ergebnisse gefunden.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Kategorie</th>
                  <th className="px-4 py-3 font-semibold">Typ</th>
                  <th className="px-4 py-3 font-semibold">Einheit</th>
                  <th className="px-4 py-3 text-right font-semibold">Preis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-white">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-surface-muted)]/60"
                  >
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {getCategoryLabel(item) || "Ohne Kategorie"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {item.item_type === "package" ? "Paket" : "Position"}
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
        )}
      </Card>
    </div>
  );
}