"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

const validRatings = ["sehr_gut", "gut", "neutral", "schlecht"];

function getRatingLabel(rating: string) {
  switch (rating) {
    case "sehr_gut":
      return "Sehr gut";
    case "gut":
      return "Gut";
    case "neutral":
      return "Neutral";
    case "schlecht":
      return "Schlecht";
    default:
      return rating;
  }
}

export async function archiveEvent(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const rating = String(formData.get("rating") ?? "").trim();
  const issues = String(formData.get("issues") ?? "").trim();
  const learnings = String(formData.get("learnings") ?? "").trim();

  if (!eventId) {
    redirect("/dashboard/events");
  }

  if (!validRatings.includes(rating) || learnings.length < 10) {
    redirect(`/dashboard/events/${eventId}?archiveError=debriefing`);
  }

  const currentUser = await getCurrentUser({ redirectTo: "/" });

  const canArchive =
    currentUser &&
    hasRole(currentUser.role, [
      ROLES.EDITOR,
      ROLES.ADMIN,
      ROLES.SYSTEMADMIN,
    ]);

  if (!canArchive) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, date, status")
    .eq("id", eventId)
    .single();

  if (!event) {
    redirect("/dashboard/events");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (event.status === "Archiviert" || event.date >= today) {
    redirect(`/dashboard/events/${eventId}`);
  }

  const debriefingText = [
    `Bewertung: ${getRatingLabel(rating)}`,
    "",
    "Probleme / Auffälligkeiten:",
    issues || "Keine besonderen Probleme erfasst.",
    "",
    "Verbesserungen / Learnings:",
    learnings,
  ].join("\n");

  const { error: debriefingInsertError } = await supabase
    .from("event_debriefings")
    .insert({
      event_id: eventId,
      user_id: currentUser.id,
      text: debriefingText,
      rating,
      issues: issues || null,
      learnings,
    });

  if (debriefingInsertError) {
    console.error(
      "Fehler beim Speichern des Debriefings:",
      debriefingInsertError.message,
    );

    redirect(`/dashboard/events/${eventId}?archiveError=debriefing`);
  }

  const { error: archiveUpdateError } = await supabase
    .from("events")
    .update({ status: "Archiviert" })
    .eq("id", eventId);

  if (archiveUpdateError) {
    console.error(
      "Fehler beim Archivieren des Events:",
      archiveUpdateError.message,
    );

    redirect(`/dashboard/events/${eventId}?archiveError=status`);
  }

  await supabase.from("event_logs").insert({
    event_id: eventId,
    user_id: currentUser.id,
    change: "Event archiviert",
  });

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/archive");
  revalidatePath("/dashboard");

  redirect(`/dashboard/events/${eventId}?from=archive`);
}