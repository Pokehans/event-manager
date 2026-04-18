import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
          {label}
        </span>
      )}

      <input
        className={`w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(26,103,123,0.12)] placeholder:text-[var(--color-text-muted)] ${className}`.trim()}
        {...props}
      />
    </label>
  );
}