"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

type UpdatePriceState = {
  success: boolean;
  message?: string;
  errors?: {
    price?: string;
  };
};

export async function updateOfferItemPrice(
  itemId: string,
  _prevState: UpdatePriceState,
  formData: FormData
): Promise<UpdatePriceState> {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canEdit = currentUser
    ? hasRole(currentUser.role, [ROLES.EDITOR, ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!canEdit) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, diese Position zu bearbeiten.",
    };
  }

  const rawPrice = String(formData.get("price") ?? "")
    .trim()
    .replace(",", ".");

  const price = Number(rawPrice);

  if (!rawPrice || Number.isNaN(price) || price <= 0) {
    return {
      success: false,
      errors: {
        price: "Bitte gib einen gültigen Preis grösser als 0 ein.",
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("offer_items")
    .update({ price })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating offer item price:", error.message);

    return {
      success: false,
      message: "Der Preis konnte nicht gespeichert werden.",
    };
  }

  revalidatePath(`/dashboard/pricelist/${itemId}`);
  revalidatePath("/dashboard/pricelist");

  return {
    success: true,
    message: "Preis gespeichert.",
  };
}