"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import type { RoomFormState } from "../../new/actions";

const allowedStatuses = ["active", "inactive", "blocked"] as const;

function normalizeOptionalString(value: string) {
  return value.trim() ? value.trim() : null;
}

function parseOptionalInteger(value: string) {
  if (!value) return null;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return NaN;
  }

  return parsed;
}

function parseEquipment(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function updateRoom(
  roomId: string,
  _state: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user || !hasRole(user.role, [ROLES.ADMIN, ROLES.SYSTEMADMIN])) {
    redirect("/dashboard/rooms");
  }

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    capacity: String(formData.get("capacity") ?? "").trim(),
    function_description: String(formData.get("function_description") ?? "").trim(),
    status: String(formData.get("status") ?? "active").trim(),
    equipment: String(formData.get("equipment") ?? "").trim(),
    internal_notes: String(formData.get("internal_notes") ?? "").trim(),
  };

  const errors: NonNullable<RoomFormState["errors"]> = {};

  if (!values.name) {
    errors.name = "Bitte einen Raumnamen erfassen.";
  }

  if (!allowedStatuses.includes(values.status as (typeof allowedStatuses)[number])) {
    errors.status = "Bitte einen gültigen Status wählen.";
  }

  const capacity = parseOptionalInteger(values.capacity);

  if (Number.isNaN(capacity)) {
    errors.capacity = "Bitte eine gültige Kapazität erfassen.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Raum konnte nicht aktualisiert werden.",
      errors,
      values,
    };
  }

  const supabase = await createClient();

  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", values.name)
    .neq("id", roomId)
    .maybeSingle();

  if (existingRoom) {
    return {
      message: "Raum existiert bereits.",
      errors: {
        name: "Ein Raum mit diesem Namen existiert bereits.",
      },
      values,
    };
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      name: values.name,
      capacity,
      function_description: normalizeOptionalString(values.function_description),
      status: values.status,
      equipment: parseEquipment(values.equipment),
      internal_notes: normalizeOptionalString(values.internal_notes),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId);

  if (error) {
    return {
      message: "Raum konnte nicht aktualisiert werden.",
      errors: {
        general: error.message,
      },
      values,
    };
  }

  const { error: logError } = await supabase.from("room_logs").insert({
    room_id: roomId,
    user_id: user.id,
    change: "Raum bearbeitet",
  });

  if (logError) {
    console.error("Fehler beim Schreiben des Raum-Logs:", logError.message);
  }

  revalidatePath("/dashboard/rooms");
  revalidatePath(`/dashboard/rooms/${roomId}`);
  redirect(`/dashboard/rooms/${roomId}`);
}