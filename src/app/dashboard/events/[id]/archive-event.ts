"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES, hasRole } from "@/lib/auth/roles";

export async function archiveEvent(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const debriefing = String(formData.get("debriefing") ?? "").trim();

  if (!eventId || debriefing.length < 10) {
    return;
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

  await supabase.from("event_debriefings").insert({
    event_id: eventId,
    user_id: currentUser.id,
    text: debriefing,
  });

  await supabase
    .from("events")
    .update({ status: "Archiviert" })
    .eq("id", eventId);

  await supabase.from("event_logs").insert({
    event_id: eventId,
    user_id: currentUser.id,
    change: "Event archiviert",
  });

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");

  redirect(`/dashboard/events/${eventId}`);
}