"use client";

type LegalModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LegalModal({ open, onClose }: LegalModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Rechtliches
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Angaben zu Impressum, Datenschutz und Kontakt.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            aria-label="Rechtliches schließen"
          >
            ×
          </button>
        </div>

        <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1 text-sm leading-6 text-[var(--color-text)]">
          <section>
            <h3 className="mb-2 font-bold text-[var(--color-text)]">
              Impressum
            </h3>
            <p>
              Max Mustermann
              <br />
              Musterstrasse 1
              <br />
              8000 Zürich
              <br />
              Schweiz
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-bold text-[var(--color-text)]">
              Datenschutz
            </h3>
            <p>
              Dieses System ist ein internes, login-geschütztes Business-Tool.
              Personenbezogene Daten werden ausschließlich zur Nutzung und
              Verwaltung des Event Manager Systems verarbeitet.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-bold text-[var(--color-text)]">
              Kontakt
            </h3>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:kontakt@example.ch"
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
              >
                kontakt@example.ch
              </a>
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}