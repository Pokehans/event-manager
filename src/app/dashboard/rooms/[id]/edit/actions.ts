"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";
import type { RoomFormState } from "../../new/actions";

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

type RoomSnapshot = {
  name: string;
  capacity: number | null;
  function_description: string | null;
  status: string;
  equipment: string[] | null;
  internal_notes: string | null;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Aktiv";
    case "inactive":
      return "Inaktiv";
    case "blocked":
      return "Gesperrt";
    default:
      return status;
  }
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatEquipment(value: string[] | null | undefined) {
  if (!value || value.length === 0) {
    return "—";
  }

  return value.join(", ");
}

function createRoomChangeLogs(
  oldRoom: RoomSnapshot,
  newRoom: RoomSnapshot
) {
  const changes: string[] = [];

  if (oldRoom.name !== newRoom.name) {
    changes.push(`Name geändert Neu: ${newRoom.name}`);
  }

  if (oldRoom.capacity !== newRoom.capacity) {
    changes.push(
      `Kapazität geändert Neu: ${
        newRoom.capacity !== null ? `${newRoom.capacity} Personen` : "—"
      }`
    );
  }

  if (oldRoom.function_description !== newRoom.function_description) {
    changes.push(
      `Funktion / Nutzung geändert Neu: ${formatValue(
        newRoom.function_description
      )}`
    );
  }

  if (oldRoom.status !== newRoom.status) {
    changes.push(`Status geändert Neu: ${getStatusLabel(newRoom.status)}`);
  }

  if (formatEquipment(oldRoom.equipment) !== formatEquipment(newRoom.equipment)) {
    changes.push(
      `Ausstattung geändert Neu: ${formatEquipment(newRoom.equipment)}`
    );
  }

  if (oldRoom.internal_notes !== newRoom.internal_notes) {
    changes.push(
      `Interne Notizen geändert Neu: ${formatValue(newRoom.internal_notes)}`
    );
  }

  return changes;
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

  const supabase = await createClient();

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
      message: "Raum konnte nicht aktualisiert werden.",
      errors,
      values,
    };
  }

  for (const file of files) {
    const cleanFileName = sanitizeFileName(file.name);
    const filePath = `rooms/${roomId}/${Date.now()}-${cleanFileName}`;

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
      room_id: roomId,
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

  const { data: currentRoom, error: currentRoomError } = await supabase
    .from("rooms")
    .select(
      "name, capacity, function_description, status, equipment, internal_notes"
    )
    .eq("id", roomId)
    .single();

  if (currentRoomError || !currentRoom) {
    return {
      message: "Raum konnte nicht aktualisiert werden.",
      errors: {
        general: currentRoomError?.message ?? "Raum wurde nicht gefunden.",
      },
      values,
    };
  }

  const updatedRoom: RoomSnapshot = {
    name: values.name,
    capacity,
    function_description: normalizeOptionalString(values.function_description),
    status: values.status,
    equipment: parseEquipment(values.equipment),
    internal_notes: normalizeOptionalString(values.internal_notes),
  };

  const changeLogs = createRoomChangeLogs(
    currentRoom as RoomSnapshot,
    updatedRoom
  );

  const { error } = await supabase
    .from("rooms")
    .update({
      ...updatedRoom,
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

  if (changeLogs.length > 0) {
    const { error: logError } = await supabase.from("room_logs").insert(
      changeLogs.map((change) => ({
        room_id: roomId,
        user_id: user.id,
        change,
      }))
    );

    if (logError) {
      console.error("Fehler beim Schreiben des Raum-Logs:", logError.message);
    }
  }

  revalidatePath("/dashboard/rooms");
  revalidatePath(`/dashboard/rooms/${roomId}`);
  redirect(`/dashboard/rooms/${roomId}`);
}