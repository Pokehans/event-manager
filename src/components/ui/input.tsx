"use client";

import { useState } from "react";

type InputProps = {
  id?: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
};

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-3.2 4.2" />
      <path d="M6.7 6.7A13.2 13.2 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.1-.8" />
    </svg>
  );
}

export default function Input({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  required = false,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const resolvedType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  const describedBy = error
    ? `${id ?? name ?? label}-error`
    : hint
      ? `${id ?? name ?? label}-hint`
      : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 ${
            isPasswordField ? "pr-12" : ""
          } ${
            error
              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15"
              : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/15"
          }`}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          id={`${id ?? name ?? label}-error`}
          className="text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id ?? name ?? label}-hint`}
          className="text-sm text-[var(--color-text-muted)]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}