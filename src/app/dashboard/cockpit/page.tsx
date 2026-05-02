import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROLES } from "@/lib/auth/roles";
import OperativeCockpit from "@/components/cockpit/operative-cockpit";
import { getEvents } from "@/lib/events/get-events";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ratingValues = {
  sehr_gut: 4,
  gut: 3,
  neutral: 2,
  schlecht: 1,
} as const;

type DebriefingRating = keyof typeof ratingValues;

function isDebriefingRating(rating: string | null): rating is DebriefingRating {
  return rating === "sehr_gut" || rating === "gut" || rating === "neutral" || rating === "schlecht";
}

function getAverageRating(ratings: DebriefingRating[]) {
  if (ratings.length === 0) return null;

  const total = ratings.reduce((sum, rating) => sum + ratingValues[rating], 0);

  return total / ratings.length;
}

export default async function CockpitPage() {
  const user = await getCurrentUser({ redirectTo: "/" });

  if (!user) return null;

  const isAdminView =
    user.role === ROLES.ADMIN || user.role === ROLES.SYSTEMADMIN;

  const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: debriefingRatings } = isAdminView
    ? await supabase
        .from("event_debriefings")
        .select("rating")
        .gte("created_at", thirtyDaysAgo.toISOString())
    : { data: [] };

    const validDebriefingRatings = (debriefingRatings ?? [])
    .map((item) => item.rating)
    .filter(isDebriefingRating);

    const averageRating = getAverageRating(validDebriefingRatings);

    const poorRatingCount = validDebriefingRatings.filter(
        (rating) => rating === "schlecht"
        ).length;

    const ratingDistribution = {
        sehr_gut: validDebriefingRatings.filter((rating) => rating === "sehr_gut").length,
        gut: validDebriefingRatings.filter((rating) => rating === "gut").length,
        neutral: validDebriefingRatings.filter((rating) => rating === "neutral").length,
        schlecht: poorRatingCount,
        };

  const events = await getEvents();
  const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyEvents = events.filter(
    (event) => event.date.slice(0, 7) === currentMonth
    );

    const confirmedEvents = monthlyEvents.filter(
    (event) => event.status === "Bestätigt"
    );

    const progressEvents = monthlyEvents.filter(
    (event) => event.status === "In Bearbeitung"
    );

    const archivedEvents = events.filter(
    (event) => event.status === "Archiviert"
    );

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">Cockpit</h1>
        <p className="page-subtitle">
          Operative Übersicht über anstehende Events und wichtige Hinweise.
        </p>
      </div>

      <OperativeCockpit events={events} />

        {isAdminView ? (
  <>
            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    Qualitätsmanagement
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Übersicht über Eventbewertungen und Debriefing-Qualität der letzten 30 Tage.
                </p>
                </div>

                {poorRatingCount > 0 ? (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {poorRatingCount} schlechte Bewertung
                    {poorRatingCount === 1 ? "" : "en"} prüfen
                </div>
                ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Ø Bewertung
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                    {averageRating ? averageRating.toFixed(1) : "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Skala 1 bis 4
                </p>
                </div>

                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Debriefings
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                    {validDebriefingRatings.length}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Letzte 30 Tage
                </p>
                </div>

                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Schlechte Events
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                    {poorRatingCount}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Kritische Nachbereitung
                </p>
                </div>

                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                    Verteilung
                </p>

                <div className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
                    <div className="flex justify-between">
                    <span>Sehr gut</span>
                    <span className="font-semibold text-[var(--color-text)]">
                        {ratingDistribution.sehr_gut}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Gut</span>
                    <span className="font-semibold text-[var(--color-text)]">
                        {ratingDistribution.gut}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Neutral</span>
                    <span className="font-semibold text-[var(--color-text)]">
                        {ratingDistribution.neutral}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Schlecht</span>
                    <span className="font-semibold text-[var(--color-text)]">
                        {ratingDistribution.schlecht}
                    </span>
                    </div>
                </div>
                </div>
            </div>
            </section>

            <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Kennzahlen
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                Übersicht für Administration und Planung.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Link
                href={`/dashboard/events?month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Events diesen Monat
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {monthlyEvents.length}
                    </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                    Anzeigen
                    </span>
                </div>
                </Link>

                <Link
                href={`/dashboard/events?status=Bestätigt&month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Bestätigt
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {confirmedEvents.length}
                    </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                    Anzeigen
                    </span>
                </div>
                </Link>

                <Link
                href={`/dashboard/events?status=In%20Bearbeitung&month=${currentMonth.slice(5, 7)}&year=${currentMonth.slice(0, 4)}`}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        In Bearbeitung
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {progressEvents.length}
                    </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                    Anzeigen
                    </span>
                </div>
                </Link>

                <Link
                href="/dashboard/events?status=Archiviert&past=1"
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:bg-[var(--color-surface-muted)]"
                >
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Archiviert gesamt
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        {archivedEvents.length}
                    </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                    Anzeigen
                    </span>
                </div>
                </Link>
            </div>
            </section>
        </>
        ) : null}
    </div>
 );
}