import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export default function Card({
  children,
  title,
  description,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm ${className}`.trim()}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="section-title">{title}</h2>}
          {description && <p className="section-text mt-1">{description}</p>}
        </div>
      )}

      {children}
    </div>
  );
}