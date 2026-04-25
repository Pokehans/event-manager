"use client";

import { useState } from "react";
import LegalModal from "@/components/legal-modal";

export default function LoginLegalFooter() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  return (
    <>
      <footer className="mt-6 text-center text-xs leading-6 text-[var(--color-text-muted)]">
        <span>© 2026 Event Manager</span>
        <span className="mx-2">·</span>
        <span>Max Mustermann</span>
        <span className="mx-2">·</span>
        <button
          type="button"
          onClick={() => setLegalModalOpen(true)}
          className="font-medium text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
        >
          Rechtliches
        </button>
      </footer>

      <LegalModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}