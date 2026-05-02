import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { EventDetail } from "@/lib/events/get-event-by-id";

type Props = {
  event: EventDetail;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("de-CH", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getRoomLabel(room: string | null) {
  switch (room) {
    case "irgendwo":
      return "Irgendwo";
    case "restaurant":
      return "Restaurant";
    case "saal":
      return "Saal";
    case "seminarraum":
      return "Seminarraum";
    case "sitzungszimmer":
      return "Sitzungszimmer";
    case "terrasse":
      return "Terrasse";
    default:
      return room || "Kein Raum definiert";
  }
}

function getPaymentTypeLabel(paymentType: string | null) {
  switch (paymentType) {
    case "barzahlung":
      return "Barzahlung";
    case "rechnung":
      return "Rechnung";
    case "intern_bewohnende":
      return "Intern Bewohnende";
    case "intern_aktivierung":
      return "Intern Aktivierung";
    case "intern_mitarbeiter":
      return "Intern Mitarbeiter";
    case "intern_gl":
      return "Intern GL";
    case "intern_vr":
      return "Intern VR";
    default:
      return paymentType || "Keine Angabe";
  }
}

function getCreatorLabel(email: string | null | undefined) {
  if (!email) return "Unbekannt";
  return email.split("@")[0] || email;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function EventRunSheetPdf({ event }: Props) {
  const contactName = [event.firstname, event.lastname]
    .filter(Boolean)
    .join(" ");

  const totalGuests = (event.adults ?? 0) + (event.children ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.date}>{formatDate(event.date)}</Text>
          </View>

          <View style={styles.meta}>
            <Text>Event-Laufzettel</Text>
            <Text>Verfasst von: {getCreatorLabel(event.users?.email)}</Text>
          </View>
        </View>

        <Section title="Kontakt">
          <Text style={styles.text}>{event.company_name || ""}</Text>
          <Text style={styles.text}>
            {contactName || "Keine Kontaktperson erfasst"}
          </Text>
          <Text style={styles.text}>{event.address || "Keine Adresse erfasst"}</Text>
          <Text style={styles.text}>
            {event.email || "Keine E-Mail"} /{" "}
            {event.phone || "Keine Telefonnummer"}
          </Text>
        </Section>

        <View style={styles.twoColumns}>
          <Section title="Gebuchte Räume">
            <Text style={styles.text}>{getRoomLabel(event.room)}</Text>
          </Section>

          <Section title="Personenzahl">
            <Field label="Erwachsene" value={event.adults ?? 0} />
            <Field label="Kinder" value={event.children ?? 0} />
            <Field label="Total" value={totalGuests} />
          </Section>
        </View>

        <View style={styles.twoColumns}>
          <Section title="Technischer Dienst">
            <Text style={styles.text}>{event.tech?.trim() || "Keine Angaben"}</Text>
          </Section>

          <Section title="Infrastruktur">
            <Text style={styles.text}>
              {event.infrastructure?.trim() || "Keine Angaben"}
            </Text>
          </Section>
        </View>

        <Section title="Zeitablauf">
          <Text style={styles.text}>
            {event.schedule?.trim() || "Ablauf noch offen"}
          </Text>
        </Section>

        <Section title="Essen & Getränke">
          <Text style={styles.subLabel}>Essen:</Text>
          <Text style={styles.text}>{event.food?.trim() || "Keine Angaben"}</Text>

          <Text style={styles.subLabel}>Getränke:</Text>
          <Text style={styles.text}>{event.drinks?.trim() || "Keine Angaben"}</Text>
        </Section>

        <Section title="Diverses">
          <Text style={styles.text}>
            {event.notes?.trim() || "Keine besonderen Hinweise erfasst"}
          </Text>
        </Section>

        <Section title="Zahlungskonditionen">
          <Text style={styles.text}>{getPaymentTypeLabel(event.payment_type)}</Text>
        </Section>

        <View style={styles.footer}>
          <Text>Interner Laufzettel</Text>
          <Text>Biffig AG | Biffig 1 | 6247 Schötz</Text>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#374151",
  },
  meta: {
    fontSize: 9,
    color: "#4B5563",
    textAlign: "right",
    gap: 3,
  },
  section: {
    marginBottom: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sectionTitle: {
    marginBottom: 6,
    fontSize: 9,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  twoColumns: {
    flexDirection: "row",
    gap: 18,
  },
  field: {
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
  },
  value: {
    fontSize: 10,
  },
  subLabel: {
    marginTop: 4,
    marginBottom: 2,
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 18,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    fontSize: 8,
    color: "#6B7280",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});