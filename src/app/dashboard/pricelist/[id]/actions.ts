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

  if (!currentUser || !canEdit) {
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
    .update({ price,  updated_by: currentUser.id, })
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

type UpdateDescriptionState = {
  success: boolean;
  message?: string;
  errors?: {
    description?: string;
  };
};

export async function updateOfferItemDescription(
  itemId: string,
  _prevState: UpdateDescriptionState,
  formData: FormData
): Promise<UpdateDescriptionState> {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canEdit = currentUser
    ? hasRole(currentUser.role, [ROLES.EDITOR, ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!currentUser || !canEdit) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, diese Position zu bearbeiten.",
    };
  }

  const description = String(formData.get("description") ?? "").trim();

  const supabase = await createClient();

  const { error } = await supabase
    .from("offer_items")
    .update({
      description: description || null, updated_by: currentUser.id,
    })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating offer item description:", error.message);

    return {
      success: false,
      message: "Die Beschreibung konnte nicht gespeichert werden.",
    };
  }

  revalidatePath(`/dashboard/pricelist/${itemId}`);
  revalidatePath("/dashboard/pricelist");

  return {
    success: true,
    message: "Beschreibung gespeichert.",
  };
}
type UpdateStatusState = {
  success: boolean;
  message?: string;
};

export async function updateOfferItemStatus(
  itemId: string,
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canEdit = currentUser
    ? hasRole(currentUser.role, [ROLES.EDITOR, ROLES.ADMIN, ROLES.SYSTEMADMIN])
    : false;

  if (!currentUser || !canEdit) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, diese Position zu bearbeiten.",
    };
  }

  const isActive = formData.get("is_active") === "true";

  const supabase = await createClient();

  const { error } = await supabase
    .from("offer_items")
    .update({ is_active: isActive, updated_by: currentUser.id, })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating offer item status:", error.message);

    return {
      success: false,
      message: "Der Status konnte nicht gespeichert werden.",
    };
  }

  revalidatePath(`/dashboard/pricelist/${itemId}`);
  revalidatePath("/dashboard/pricelist");

  return {
    success: true,
    message: isActive ? "Status aktiv." : "Status inaktiv.",
  };
}