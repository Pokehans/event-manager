# Event Manager

##  Ziel

Entwicklung eines internen Event-Management-Systems für Betriebe zur Verwaltung von Veranstaltungen.

Das System ist:

* nur intern zugänglich (kein Gästezugriff)
* login-geschützt
* später als Lizenzprodukt verkaufbar

## Geschäftsmodell

* 1 Benutzer = 1 Lizenz
* Benutzer werden durch Systemadmin erstellt
* Lizenzlaufzeiten individuell (monatlich, jährlich etc.)

## Architektur

* Frontend: Next.js
* Backend & DB: Supabase
* Hosting: Vercel
* Versionskontrolle: GitHub

## Strategie

* V2 startet als Single-Betrieb-System
* später Erweiterung auf mehrere Betriebe möglich
* pro Betrieb eigene Installation & Datenbank

## Versionen

* V2.0 → Kernsystem (MVP)
* V2.1 → Erweiterungen (Räume, Preislisten)
* V2.2 → Offerten & Rechnungen
* V2.3 → Statistiken & Auswertungen
