import Link from "next/link";
import type { CalendarEvent } from "@/lib/events/get-events-for-month";
import StatusBadge from "@/components/ui/status-badge";

type Props = {
  currentDate: Date;
  events: CalendarEvent[];
};

function getEventStyle(event: CalendarEvent) {
  const color = event.users?.departments?.color ?? "#94a3b8";

  return {
    backgroundColor: `${color}26`,
    borderColor: `${color}66`,
    textColor: color,
  };
}

function getStatusLabel(status: string) {
  switch (status) {
    case "anfrage":
      return "Anfrage";
    case "bearbeitung":
      return "In Bearbeitung";
    case "bestaetigt":
      return "Bestätigt";
    case "storniert":
      return "Storniert";
    case "archiviert":
      return "Archiviert";
    default:
      return status;
  }
}

function getSecondaryLabel(event: CalendarEvent) {
  if (event.company_name) return event.company_name;
  if (event.lastname) return event.lastname;
  return null;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEventDetailUrl(eventId: string, currentDate: Date) {
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  return `/dashboard/events/${eventId}?month=${month}&year=${year}`;
}

function NewBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
      NEW
    </span>
  );
}

export default function MonthGrid({ currentDate, events }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = lastDayOfMonth.getDate();

  const days: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const weekdayLabelsLong = [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
    "Sonntag",
  ];

  const getEventsForDay = (day: Date) => {
    const dayString = formatLocalDate(day);
    return events.filter((event) => event.date === dayString);
  };

  return (
    <div className="mt-6">
      <div className="hidden md:block">
        <div className="mb-2 grid grid-cols-7 gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
          {weekdayLabels.map((d) => (
            <div key={d} className="px-2 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isToday =
              day && new Date(day).toDateString() === new Date().toDateString();

            const dayEvents = day ? getEventsForDay(day) : [];

            return (
              <div
                key={index}
                className={`min-h-[120px] rounded-xl border p-2 text-sm ${
                  day
                    ? isToday
                      ? "border-[rgba(219,142,34,0.25)] bg-[rgba(219,142,34,0.08)]"
                      : "border-[var(--color-border)] bg-white"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-xs font-semibold ${
                        isToday
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const style = getEventStyle(event);
                        const secondaryLabel = getSecondaryLabel(event);

                        return (
                          <Link
                            key={event.id}
                            href={getEventDetailUrl(event.id, currentDate)}
                            className="block rounded-lg border px-2 py-1 transition hover:opacity-90"
                            style={{
                              backgroundColor: style.backgroundColor,
                              borderColor: style.borderColor,
                              color: style.textColor,
                            }}
                            title={`${event.title}${
                              secondaryLabel ? ` – ${secondaryLabel}` : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1 truncate text-xs font-semibold">
                                {event.title}
                              </div>
                              {event.hasChanges && <NewBadge />}
                            </div>

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="truncate text-[10px] opacity-80">
                                {secondaryLabel ?? ""}
                              </span>
                              <StatusBadge label={getStatusLabel(event.status)} />
                            </div>
                          </Link>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <div className="text-xs text-[var(--color-text-muted)]">
                          + {dayEvents.length - 3} weitere
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {days.map((day, index) => {
          if (!day) return null;

          const isToday =
            new Date(day).toDateString() === new Date().toDateString();

          const weekdayIndex = (day.getDay() + 6) % 7;
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={index}
              className={`rounded-2xl border p-4 ${
                isToday
                  ? "border-[rgba(219,142,34,0.25)] bg-[rgba(219,142,34,0.08)]"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {weekdayLabelsLong[weekdayIndex]}
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${
                      isToday
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {day.getDate()}.{" "}
                    {day.toLocaleString("de-CH", { month: "long" })}
                  </p>
                </div>

                {isToday && (
                  <span className="rounded-full bg-[rgba(219,142,34,0.14)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                    Heute
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => {
                    const style = getEventStyle(event);
                    const secondaryLabel = getSecondaryLabel(event);

                    return (
                      <Link
                        key={event.id}
                        href={getEventDetailUrl(event.id, currentDate)}
                        className="block rounded-xl border px-3 py-2 transition hover:opacity-90"
                        style={{
                          backgroundColor: style.backgroundColor,
                          borderColor: style.borderColor,
                          color: style.textColor,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 text-sm font-semibold">
                            {event.title}
                          </div>
                          {event.hasChanges && <NewBadge />}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {secondaryLabel && (
                            <span className="text-xs opacity-80">
                              {secondaryLabel}
                            </span>
                          )}
                          <StatusBadge label={getStatusLabel(event.status)} />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Keine Einträge
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}