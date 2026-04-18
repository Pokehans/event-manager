import { EventForm } from "./event-form";

export default function NewEventPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">Event erstellen</h1>
        <p className="page-subtitle">
          Neues Event erfassen und direkt im Kalender anzeigen.
        </p>
      </div>

      <EventForm />
    </div>
  );
}