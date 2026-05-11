"use client";

import { type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import type { OfferItem } from "@/lib/offers/get-offer-items";

type Props = {
  items: OfferItem[];
  currentUserRole: string | null;
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

function getOfferItemHref(itemId: string) {
  return `/dashboard/pricelist/${itemId}`;
}

function MaybeOfferItemLink({
  canOpen,
  href,
  className,
  children,
}: {
  canOpen: boolean;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (!canOpen) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function PricelistClient({ items, currentUserRole }: Props) {
  const canOpenOfferItems = ["editor", "admin", "systemadmin"].includes(
    currentUserRole ?? ""
    );
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

  const typeFilterLabel =
    typeFilter === "package"
        ? "Paket"
        : typeFilter === "item"
            ? "Position"
            : "";

  const activeChips = [
    search.trim() && {
        label: `Suche: ${search}`,
        onRemove: () => setSearch(""),
    },

    mainCategoryFilter !== "all" && {
        label: `Kategorie: ${mainCategoryFilter}`,
        onRemove: () => {
        setMainCategoryFilter("all");
        setSubCategoryFilter("all");
        setDetailCategoryFilter("all");
        },
    },

    subCategoryFilter !== "all" && {
        label: `Unterkategorie: ${subCategoryFilter}`,
        onRemove: () => {
        setSubCategoryFilter("all");
        setDetailCategoryFilter("all");
        },
    },

    detailCategoryFilter !== "all" && {
        label: `Detail: ${detailCategoryFilter}`,
        onRemove: () => setDetailCategoryFilter("all"),
    },

    typeFilter !== "all" && {
        label: `Typ: ${typeFilterLabel}`,
        onRemove: () => setTypeFilter("all"),
    },
    ].filter(
    (chip): chip is { label: string; onRemove: () => void } => Boolean(chip)
    );

  const clearFilters = () => {
    setSearch("");
    setMainCategoryFilter("all");
    setSubCategoryFilter("all");
    setDetailCategoryFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
            <h1 className="page-title">Preisliste</h1>
            <p className="page-subtitle">
            Strukturierte Übersicht aller Angebotspositionen.
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <Link
            href="/dashboard/pricelist/new"
            className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
            >
            Position erstellen
            </Link>
        </div>
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

            {activeChips.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {activeChips.map((chip, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs shadow-sm"
                    >
                        <span>{chip.label}</span>

                        <button
                        type="button"
                        onClick={chip.onRemove}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                        >
                        ×
                        </button>
                    </div>
                    ))}
                </div>
                )}

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

      <div>
        
        {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
            <h2 className="section-title">Keine passenden Positionen gefunden</h2>
            <p className="section-text mt-2">
                Passe die Suche oder Filter an, um wieder Positionen anzuzeigen.
            </p>
            </div>
        ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                    <tr>
                    <th className="px-5 py-4 font-bold">Position</th>
                    <th className="px-5 py-4 font-bold">Kategorie</th>
                    <th className="px-5 py-4 text-right font-bold">Preis</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredItems.map((item) => (
                    <tr
                        key={item.id}
                        className={`group transition ${
                            canOpenOfferItems
                                ? "cursor-pointer hover:bg-[var(--color-surface-muted)]/70"
                                : ""
                        }`}
                    >
                        <td className="px-5 py-4 font-semibold text-[var(--color-text)]">
                        <MaybeOfferItemLink
                            canOpen={canOpenOfferItems}
                            href={getOfferItemHref(item.id)}
                            className="block"
                            >
                            {item.name}
                        </MaybeOfferItemLink>
                        </td>

                        <td className="px-5 py-4 text-[var(--color-text-muted)]">
                        <Link href={getOfferItemHref(item.id)} className="block">
                            {getCategoryLabel(item) || "Ohne Kategorie"}
                        </Link>
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-[var(--color-text)]">
                        <Link href={getOfferItemHref(item.id)} className="block">
                            {formatPrice(item.price)}
                        </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <div className="divide-y divide-[var(--color-border)] lg:hidden">
                {filteredItems.map((item) => {
                    const mobileContent = (
                    <>
                        <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-[var(--color-primary)]">
                            {item.item_type === "package" ? "Paket" : "Position"}
                            </p>
                            <h2 className="mt-1 font-bold text-[var(--color-text)]">
                            {item.name}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {getCategoryLabel(item) || "Ohne Kategorie"}
                            </p>
                        </div>

                        <p className="shrink-0 text-right font-bold text-[var(--color-text)]">
                            {formatPrice(item.price)}
                        </p>
                        </div>
                    </>
                    );

                    if (!canOpenOfferItems) {
                    return (
                        <div key={item.id} className="block p-5">
                        {mobileContent}
                        </div>
                    );
                    }

                    return (
                    <Link
                        key={item.id}
                        href={getOfferItemHref(item.id)}
                        className="block p-5 transition hover:bg-[var(--color-surface-muted)]"
                    >
                        {mobileContent}
                    </Link>
                    );
                })}
            </div>
        </div>
        )}
        </div>
    </div>
  );
}