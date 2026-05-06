"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

export type RoomFormState = {
  message?: string;
  errors?: {
  name?: string;
  capacity?: string;
  status?: string;
  images?: string;
  general?: string;
};
  values?: {
    name?: string;
    capacity?: string;
    function_description?: string;
    status?: string;
    equipment?: string;
    internal_notes?: string;
  };
};

const allowedStatuses = ["active", "inactive", "blocked"] as const;
const ROOM_IMAGES_BUCKET = "room-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

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

export async function createRoom(
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

  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.images = "Es sind nur JPG, PNG, WEBP oder GIF erlaubt.";
      break;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.images = "Ein Bild darf maximal 5 MB gross sein.";
      break;
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Raum konnte nicht erstellt werden.",
      errors,
      values,
    };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", values.name)
    .maybeSingle();

    if (existing) {
    return {
        message: "Raum existiert bereits.",
        errors: {
        name: "Ein Raum mit diesem Namen existiert bereits.",
        },
        values,
    };
    }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name: values.name,
      capacity,
      function_description: normalizeOptionalString(values.function_description),
      status: values.status,
      equipment: parseEquipment(values.equipment),
      internal_notes: normalizeOptionalString(values.internal_notes),
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error || !room) {
    return {
      message: "Raum konnte nicht erstellt werden.",
      errors: {
        general: error?.message ?? "Unbekannter Fehler.",
      },
      values,
    };
  }

  for (const file of files) {
    const cleanFileName = sanitizeFileName(file.name);
    const filePath = `rooms/${room.id}/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(ROOM_IMAGES_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Fehler beim Hochladen des Raumbildes:", uploadError.message);
      continue;
    }

    const { error: imageInsertError } = await supabase.from("room_images").insert({
      room_id: room.id,
      file_path: filePath,
      file_name: file.name,
      alt_text: file.name,
      sort_order: 0,
    });

    if (imageInsertError) {
      console.error("Fehler beim Speichern des Raumbildes:", imageInsertError.message);
      await supabase.storage.from(ROOM_IMAGES_BUCKET).remove([filePath]);
    }
  }

  const { error: logError } = await supabase.from("room_logs").insert({
    room_id: room.id,
    user_id: user.id,
    change: "Raum erstellt",
  });

  if (logError) {
    console.error("Fehler beim Schreiben des Raum-Logs:", logError.message);
  }

  revalidatePath("/dashboard/rooms");
  redirect(`/dashboard/rooms/${room.id}`);
}