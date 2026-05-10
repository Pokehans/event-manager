"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import type { OfferItem } from "@/lib/offers/get-offer-items";
import { getUnitLabel } from "./utils";

type Props = {
  items: OfferItem[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(price);
}

export default function PricelistClient({ items }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "item" | "package">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();

    items.forEach((item) => {
      const categoryName = item.category?.parent?.name ?? item.category?.name;
      if (categoryName) set.add(categoryName);
    });

    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchValue = search.trim().toLowerCase();

      if (searchValue && !item.name.toLowerCase().includes(searchValue)) {
        return false;
      }

      if (typeFilter !== "all" && item.item_type !== typeFilter) {
        return false;
      }

      const categoryName = item.category?.parent?.name ?? item.category?.name;

      if (categoryFilter !== "all" && categoryName !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [items, search, typeFilter, categoryFilter]);

  const hasActiveFilters =
    search.trim() !== "" || typeFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="page-title">Preisliste</h1>
        <p className="page-subtitle">
          Strukturierte Übersicht aller Angebotspositionen.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4 shadow-sm backdrop-blur lg:sticky lg:top-4 lg:z-20">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-center">
          <Input
            label="Suche"
            placeholder="Suche nach Position..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "all" | "item" | "package")
            }
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]"
          >
            <option value="all">Alle Typen</option>
            <option value="item">Position</option>
            <option value="package">Paket</option>
          </select>

          <Button
            type="button"
            variant="secondary"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setTypeFilter("all");
            }}
          >
            Filter löschen
          </Button>
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
                      {item.category?.parent?.name
                        ? `${item.category.parent.name} / ${item.category.name}`
                        : item.category?.name ?? "Ohne Kategorie"}
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