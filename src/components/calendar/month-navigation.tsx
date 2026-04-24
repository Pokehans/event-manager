"use client";

type Props = {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
};

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function getYearOptions(currentYear: number) {
  const startYear = currentYear - 3;
  const endYear = currentYear + 5;

  const years: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
}

export default function MonthNavigation({
  currentDate,
  onPrev,
  onNext,
  onToday,
  onMonthChange,
  onYearChange,
}: Props) {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const yearOptions = getYearOptions(new Date().getFullYear());

  const monthLabel = currentDate.toLocaleString("de-CH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Kalender
        </p>
        <h1 className="page-title capitalize">{monthLabel}</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <label className="sr-only" htmlFor="calendar-month">
            Monat auswählen
          </label>
          <select
            id="calendar-month"
            value={currentMonth}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text)] outline-none transition hover:bg-[var(--color-surface-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="calendar-year">
            Jahr auswählen
          </label>
          <select
            id="calendar-year"
            value={currentYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text)] outline-none transition hover:bg-[var(--color-surface-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={onToday}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)]"
          >
            Heute
          </button>

          <button
            type="button"
            onClick={onPrev}
            className="h-10 rounded-xl border border-[var(--color-border)] px-4 text-lg transition hover:bg-[var(--color-surface-muted)] sm:w-10 sm:px-0"
            aria-label="Vorheriger Monat"
            title="Vorheriger Monat"
          >
            ←
          </button>

          <button
            type="button"
            onClick={onNext}
            className="h-10 rounded-xl border border-[var(--color-border)] px-4 text-lg transition hover:bg-[var(--color-surface-muted)] sm:w-10 sm:px-0"
            aria-label="Nächster Monat"
            title="Nächster Monat"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}