"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

export type CreateOfferItemState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string;
    category_id?: string;
    price?: string;
    unit?: string;
    item_type?: string;
  };
};

const VALID_UNITS = ["person", "portion", "piece", "bottle"];
const VALID_ITEM_TYPES = ["item", "package"];

export async function createOfferItem(
  _prevState: CreateOfferItemState,
  formData: FormData
): Promise<CreateOfferItemState> {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canCreate = currentUser
    ? hasRole(currentUser.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!currentUser || !canCreate) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, Positionen zu erstellen.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "")
    .trim()
    .replace(",", ".");
  const unit = String(formData.get("unit") ?? "").trim();
  const itemType = String(formData.get("item_type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const price = Number(rawPrice);

  const errors: CreateOfferItemState["errors"] = {};

  if (!name) {
    errors.name = "Bitte gib einen Namen ein.";
  }

  if (!categoryId) {
    errors.category_id = "Bitte wähle eine Kategorie.";
  }

  if (!rawPrice || Number.isNaN(price) || price <= 0) {
    errors.price = "Bitte gib einen gültigen Preis grösser als 0 ein.";
  }

  if (!VALID_UNITS.includes(unit)) {
    errors.unit = "Bitte wähle eine gültige Einheit.";
  }

  if (!VALID_ITEM_TYPES.includes(itemType)) {
    errors.item_type = "Bitte wähle einen gültigen Typ.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offer_items")
    .insert({
      name,
      category_id: categoryId,
      price,
      unit,
      item_type: itemType,
      description: description || null,
      is_active: true,
      created_by: currentUser.id,
      updated_by: currentUser.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating offer item:", error.message);

    return {
      success: false,
      message: "Die Position konnte nicht erstellt werden.",
    };
  }

  redirect(`/dashboard/pricelist/${data.id}`);
}