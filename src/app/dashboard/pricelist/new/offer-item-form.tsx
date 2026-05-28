"use client";

import { useActionState } from "react";
import type { OfferCategory } from "@/lib/offers/get-offer-items";
import { createOfferItem } from "./actions";

type Props = {
  categories: OfferCategory[];
};

function getCategoryLabel(category: OfferCategory) {
  return category.category_path.map((item) => item.name).join(" / ");
}

function fieldClass(error?: string) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition",
    error
      ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]",
  ].join(" ");
}

export function OfferItemForm({ categories }: Props) {
  const [state, formAction, pending] = useActionState(createOfferItem, {
    success: false,
  });

  return (
  <div className="space-y-6">
    <form action={formAction} className="space-y-6">
        {state.message ? (
          <div className="rounded-xl border border-[var(--color-danger)] bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
            {state.message}
          </div>
        ) : null}

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="section-title">Basisdaten</h2>
            <p className="section-text">
              Grundinformationen zur Position, Kategorie und Preisgestaltung.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Name</span>
              <input
                name="name"
                className={fieldClass(state.errors?.name)}
              />
              {state.errors?.name ? (
                <p className="text-sm text-[var(--color-danger)]">
                  {state.errors.name}
                </p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Kategorie</span>
              <select
                name="category_id"
                defaultValue=""
                className={fieldClass(state.errors?.category_id)}
              >
                <option value="">Kategorie wählen</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
              {state.errors?.category_id ? (
                <p className="text-sm text-[var(--color-danger)]">
                  {state.errors.category_id}
                </p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Preis</span>
              <input
                name="price"
                inputMode="decimal"
                className={fieldClass(state.errors?.price)}
              />
              {state.errors?.price ? (
                <p className="text-sm text-[var(--color-danger)]">
                  {state.errors.price}
                </p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Einheit / Größe</span>
              <select
                name="unit"
                defaultValue="person"
                className={fieldClass(state.errors?.unit)}
              >
                <option value="person">Person</option>
                <option value="portion">Portion</option>
                <option value="piece">Stück</option>
                <option value="bottle">Flasche</option>
              </select>
              {state.errors?.unit ? (
                <p className="text-sm text-[var(--color-danger)]">
                  {state.errors.unit}
                </p>
              ) : null}
            </label>

            <label className="space-y-2">
            <span className="text-sm font-medium">Typ</span>
              <select
                name="item_type"
                defaultValue="item"
                className={fieldClass(state.errors?.item_type)}
              >
                <option value="item">Position</option>
                <option value="package">Paket</option>
              </select>
              {state.errors?.item_type ? (
                <p className="text-sm text-[var(--color-danger)]">
                  {state.errors.item_type}
                </p>
              ) : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Beschreibung</span>
              <textarea
                name="description"
                rows={6}
                className={fieldClass()}
                placeholder="z. B. Kaffee, Gipfeli, Orangensaft ..."
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            Nach dem Speichern erscheint die Position in der Preisliste.
          </p>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] disabled:shadow-none"
          >
            {pending ? "Position wird erstellt..." : "Position erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
}