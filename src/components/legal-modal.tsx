"use client";

import { useState } from "react";

type LegalModalProps = {
  open: boolean;
  onClose: () => void;
};

type TabKey = "impressum" | "datenschutz" | "kontakt";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function LegalModal({ open, onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("impressum");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Rechtliches
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Impressum, Datenschutz und Kontaktinformationen.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "impressum"}
            onClick={() => setActiveTab("impressum")}
          >
            Impressum
          </TabButton>

          <TabButton
            active={activeTab === "datenschutz"}
            onClick={() => setActiveTab("datenschutz")}
          >
            Datenschutz
          </TabButton>

          <TabButton
            active={activeTab === "kontakt"}
            onClick={() => setActiveTab("kontakt")}
          >
            Kontakt
          </TabButton>
        </div>

        <div className="h-[420px] max-h-[65vh] overflow-y-auto pr-1 text-sm leading-6 text-[var(--color-text)]">
          {activeTab === "impressum" ? (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 font-bold">
                  Verantwortlich für den Inhalt dieser Installation
                </h3>
                <p>
                  Biffig AG
                  <br />
                  Biffig 1
                  <br />
                  6247 Schötz
                  <br />
                  Schweiz
                  <br />
                  Tel: 041 984 23 00
                  <br />
                  E-Mail: info@biffig.ch
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">UID</h3>
                <p>CHE-102.528.229 MWST</p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">
                  Technische Umsetzung / Software
                </h3>
                <p>
                  Sandro Smania
                  <br />
                  Sackweidhöhe 1
                  <br />
                  6012 Obernau
                  <br />
                  Schweiz
                  <br />
                  E-Mail: sandro@sandrosmania.ch
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Produkt</h3>
                <p>
                  Event Manager
                  <br />
                  Interne Webanwendung für Event-Management.
                </p>
              </section>
            </div>
          ) : null}

          {activeTab === "datenschutz" ? (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 font-bold">Verantwortlichkeit</h3>
                <p>
                  Diese Installation von Event Manager wird durch den jeweiligen
                  Lizenznehmer betrieben. Verantwortlich für die Bearbeitung
                  personenbezogener Daten innerhalb dieser Installation ist der
                  Lizenznehmer.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Zweck der Datenbearbeitung</h3>
                <p>
                  Die Anwendung dient der Planung, Verwaltung und Organisation
                  betrieblicher Veranstaltungen sowie interner Prozesse.
                  Personendaten werden zur Anmeldung, Benutzerverwaltung,
                  Nutzung der Plattform und Sicherstellung des Betriebs
                  bearbeitet.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">
                  Gespeicherte und bearbeitete Daten
                </h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Benutzerkonten, E-Mail-Adressen und Rollen</li>
                  <li>Bereiche, Abteilungen und Berechtigungen</li>
                  <li>Eventdaten und organisatorische Informationen</li>
                  <li>Interne Notizen und Änderungsprotokolle</li>
                  <li>Login-, Sitzungs- und technische Logdaten</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Cookies</h3>
                <p>
                  Es werden ausschließlich technisch notwendige Cookies für
                  Login, Session-Verwaltung und Sicherheit verwendet. Es werden
                  keine Tracking- oder Marketing-Cookies eingesetzt.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Technische Infrastruktur</h3>
                <p>
                  Für Hosting, Datenbankbetrieb, Authentifizierung, Deployment
                  und Systembetrieb können externe technische Dienstleister
                  eingesetzt werden, welche Daten im Auftrag des Lizenznehmers
                  verarbeiten und speichern.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Technischer Anbieter</h3>
                <p>
                  Die technische Bereitstellung, Programmierung und
                  Weiterentwicklung der Software erfolgt durch Sandro Smania.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Rechte betroffener Personen</h3>
                <p>
                  Betroffene Personen können im Rahmen der geltenden
                  gesetzlichen Bestimmungen Auskunft, Berichtigung oder Löschung
                  ihrer gespeicherten Daten verlangen. Entsprechende Anfragen
                  sind an den jeweiligen Lizenznehmer zu richten.
                </p>
              </section>
            </div>
          ) : null}

          {activeTab === "kontakt" ? (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 font-bold">Betrieb / Lizenznehmer</h3>
                <p>
                  Biffig AG
                  <br />
                  Tel: 041 984 23 00
                  <br />
                  E-Mail: info@biffig.ch
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Technischer Support</h3>
                <p>
                  Sandro Smania
                  <br />
                  E-Mail: sandro@sandrosmania.ch
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold">Datenschutzanfragen</h3>
                <p>
                  Datenschutzanfragen sind grundsätzlich an den jeweiligen
                  Lizenznehmer zu richten.
                  <br />
                  Für diese Installation: info@biffig.ch
                </p>
              </section>

              <section>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Stand: April 2026
                </p>
              </section>
            </div>
          ) : null}
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