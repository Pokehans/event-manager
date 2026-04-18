"use client";

type Props = {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function MonthNavigation({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const month = currentDate.toLocaleString("de-CH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-title capitalize">{month}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--color-surface-muted)]"
        >
          Heute
        </button>

        <button
          onClick={onPrev}
          className="h-10 w-10 rounded-xl border border-[var(--color-border)] text-lg hover:bg-[var(--color-surface-muted)]"
        >
          ←
        </button>

        <button
          onClick={onNext}
          className="h-10 w-10 rounded-xl border border-[var(--color-border)] text-lg hover:bg-[var(--color-surface-muted)]"
        >
          →
        </button>
      </div>
    </div>
  );
}