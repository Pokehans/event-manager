"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { OfferCategory } from "@/lib/offers/get-offer-items";
import { createOfferItem } from "./actions";

type Props = {
  categories: OfferCategory[];
};

function getCategoryLabel(category: OfferCategory) {
  return category.category_path.map((item) => item.name).join(" / ");
}

export function OfferItemForm({ categories }: Props) {
  const [state, formAction] = useActionState(createOfferItem, {
    success: false,
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          {state.errors?.name ? (
            <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Kategorie</label>
          <select
            name="category_id"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Kategorie wählen</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          {state.errors?.category_id ? (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.category_id}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Preis</label>
          <input
            name="price"
            inputMode="decimal"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          {state.errors?.price ? (
            <p className="mt-1 text-xs text-red-600">{state.errors.price}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Einheit / Größe</label>
          <select
            name="unit"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            defaultValue="person"
          >
            <option value="person">Person</option>
            <option value="portion">Portion</option>
            <option value="piece">Stück</option>
            <option value="bottle">Flasche</option>
          </select>
          {state.errors?.unit ? (
            <p className="mt-1 text-xs text-red-600">{state.errors.unit}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Typ</label>
          <select
            name="item_type"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            defaultValue="item"
          >
            <option value="item">Position</option>
            <option value="package">Paket</option>
          </select>
          {state.errors?.item_type ? (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.item_type}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Beschreibung</label>
        <textarea
          name="description"
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Position erstellen
        </button>

        <Link
            href="/dashboard/pricelist"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
            >
            Abbrechen
        </Link>
      </div>
    </form>
  );
}