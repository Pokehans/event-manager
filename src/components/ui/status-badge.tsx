type Props = {
  label: string;
};

export default function StatusBadge({ label }: Props) {
  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1.5 py-[2px] text-[9px] leading-none font-semibold text-[var(--color-text-muted)]">
      {label}
    </span>
  );
}