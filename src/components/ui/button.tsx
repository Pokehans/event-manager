import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)]",
    secondary:
      "border border-[var(--color-border)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]",
    ghost:
      "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className}`.trim()}
      {...props}
    />
  );
}