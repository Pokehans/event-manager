"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROLES, hasRole, type UserRole } from "@/lib/auth/roles";

const ROOM_IMAGES_BUCKET = "room-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type ActionState = {
  success: boolean;
  message: string;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

async function requireRoomImagePermission() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, allowed: false };
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = currentUser?.role as UserRole | undefined;

  return {
    supabase,
    allowed: role ? hasRole(role, [ROLES.ADMIN, ROLES.SYSTEMADMIN]) : false,
  };
}

export async function uploadRoomImages(
  roomId: string,
  formData: FormData
): Promise<ActionState> {
  const { supabase, allowed } = await requireRoomImagePermission();

  if (!allowed) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, Bilder hochzuladen.",
    };
  }

  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return {
      success: false,
      message: "Bitte mindestens ein Bild auswählen.",
    };
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        message: "Es sind nur JPG, PNG, WEBP oder GIF erlaubt.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: "Ein Bild darf maximal 5 MB gross sein.",
      };
    }
  }

  for (const file of files) {
    const cleanFileName = sanitizeFileName(file.name);
    const filePath = `rooms/${roomId}/${Date.now()}-${cleanFileName}`;

    let uploadErrorMessage: string | null = null;

    try {
    const { error: uploadError } = await supabase.storage
        .from(ROOM_IMAGES_BUCKET)
        .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
        });

    if (uploadError) {
        uploadErrorMessage = uploadError.message;
    }
    } catch (error) {
    uploadErrorMessage =
        error instanceof Error ? error.message : "Unbekannter Upload-Fehler";
    }

    if (uploadErrorMessage) {
    return {
        success: false,
        message: `Bild konnte nicht hochgeladen werden: ${uploadErrorMessage}`,
    };
    }

    const { error: insertError } = await supabase.from("room_images").insert({
    room_id: roomId,
    file_path: filePath,
    file_name: file.name,
    alt_text: file.name,
    sort_order: 0,
    });

    if (insertError) {
      await supabase.storage.from(ROOM_IMAGES_BUCKET).remove([filePath]);

      return {
        success: false,
        message: "Bild konnte nicht gespeichert werden.",
      };
    }
  }

  revalidatePath(`/dashboard/rooms/${roomId}`);

  return {
    success: true,
    message: "Bilder wurden hochgeladen.",
  };
}

export async function deleteRoomImage(
  roomId: string,
  imageId: string,
  filePath: string
): Promise<ActionState> {
  const { supabase, allowed } = await requireRoomImagePermission();

  if (!allowed) {
    return {
      success: false,
      message: "Du hast keine Berechtigung, Bilder zu löschen.",
    };
  }

  const { error: deleteFileError } = await supabase.storage
    .from(ROOM_IMAGES_BUCKET)
    .remove([filePath]);

  if (deleteFileError) {
    return {
      success: false,
      message: "Bilddatei konnte nicht gelöscht werden.",
    };
  }

  const { error: deleteRowError } = await supabase
    .from("room_images")
    .delete()
    .eq("id", imageId)
    .eq("room_id", roomId);

  if (deleteRowError) {
    return {
      success: false,
      message: "Bildeintrag konnte nicht gelöscht werden.",
    };
  }

  revalidatePath(`/dashboard/rooms/${roomId}`);

  return {
    success: true,
    message: "Bild wurde gelöscht.",
  };
}