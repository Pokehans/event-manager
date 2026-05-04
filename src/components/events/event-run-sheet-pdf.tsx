import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { EventDetail } from "@/lib/events/get-event-by-id";
import fs from "node:fs";
import path from "node:path";

type Props = {
  event: EventDetail;
};

const logoPath = path.join(process.cwd(), "public", "logo.png");
const logoBase64 = `data:image/png;base64,${fs
  .readFileSync(logoPath)
  .toString("base64")}`;

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

function text(value: string | null | undefined, fallback = "Keine Angaben") {
  return value?.trim() || fallback;
}

function shouldBreakBeforeFood(event: EventDetail) {
  const scheduleLength = event.schedule?.trim().length ?? 0;

  return scheduleLength > 650;
}

function estimateTextLines(value: string | null | undefined, charsPerLine = 95) {
  const normalized = value?.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split("\n").reduce((total, line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return total + 1;
    }

    return total + Math.max(1, Math.ceil(trimmedLine.length / charsPerLine));
  }, 0);
}

function shouldBreakBeforeNotes(event: EventDetail) {
  const foodLines = estimateTextLines(event.food);
  const drinksLines = estimateTextLines(event.drinks);
  const notesLines = estimateTextLines(event.notes);

  return foodLines + drinksLines >= 14 || notesLines >= 5;
}

function Section({
  title,
  children,
  breakBefore = false,
}: {
  title: string;
  children: React.ReactNode;
  breakBefore?: boolean;
}) {
  return (
    <View style={styles.section} break={breakBefore}>
      <View style={styles.sectionHeader} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function EventRunSheetPdf({ event }: Props) {
  const contactName = [event.firstname, event.lastname]
    .filter(Boolean)
    .join(" ");

  const totalGuests = (event.adults ?? 0) + (event.children ?? 0);
  const breakBeforeFood = shouldBreakBeforeFood(event);
  const breakBeforeNotes = shouldBreakBeforeNotes(event);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.document}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={logoBase64} style={styles.logo} />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.date}>{formatDate(event.date)}</Text>
            </View>

            <View style={styles.creatorBox}>
              <Text style={styles.creatorText}>
                Verfasst von: {getCreatorLabel(event.users?.email)}
              </Text>
            </View>
          </View>

          <Section title="Kontaktdaten">
            <Text style={styles.text}>
              {event.company_name ? `${event.company_name}\n` : ""}
              {contactName || "Keine Kontaktperson erfasst"}
              {"\n"}
              {text(event.address, "Keine Adresse erfasst")}
              {"\n"}
              {text(event.email, "Keine E-Mail")} /{" "}
              {text(event.phone, "Keine Telefonnummer")}
            </Text>
          </Section>

          <View style={styles.twoColumnRow}>
            <View style={styles.leftColumn}>
              <Section title="Gebuchte Räume">
                <Text style={styles.text}>{getRoomLabel(event.room)}</Text>
              </Section>
            </View>

            <View style={styles.rightColumn}>
              <Section title="Personenzahl">
                <InfoLine label="Erwachsene" value={event.adults ?? 0} />
                <InfoLine label="Kinder" value={event.children ?? 0} />
                <InfoLine label="Total" value={totalGuests} />
              </Section>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.leftColumn}>
              <Section title="Technischer Dienst">
                <Text style={styles.text}>{text(event.tech)}</Text>
              </Section>
            </View>

            <View style={styles.rightColumn}>
              <Section title="Infrastruktur">
                <Text style={styles.text}>{text(event.infrastructure)}</Text>
              </Section>
            </View>
          </View>

          <Section title="Zeitablauf">
            <Text style={styles.text}>{text(event.schedule, "Ablauf noch offen")}</Text>
          </Section>

          <Section title="Essen & Getränke" breakBefore={breakBeforeFood}>
            <Text style={styles.subTitle}>Essen:</Text>
            <Text style={styles.text}>{text(event.food)}</Text>

            <Text style={styles.subTitle}>Getränke:</Text>
            <Text style={styles.text}>{text(event.drinks)}</Text>
          </Section>

          <Section title="Diverses" breakBefore={breakBeforeNotes}>
            <Text style={styles.text}>
              {text(event.notes, "Keine besonderen Hinweise")}
            </Text>
          </Section>

          <Section title="Zahlungskonditionen">
            <Text style={styles.text}>{getPaymentTypeLabel(event.payment_type)}</Text>
          </Section>

          <View fixed style={styles.footer}>
            <Text style={styles.footerCompany}>
              Biffig AG | Biffig 1 | 6247 Schötz | 041 984 23 00 |
              www.biffig.ch
            </Text>

            <Text
              style={styles.footerMeta}
              render={({ pageNumber, totalPages }) =>
                `${new Date().toLocaleString("de-CH")} ${pageNumber}/${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  document: {
    borderWidth: 1,
    borderColor: "#D6D6D6",
    minHeight: "100%",
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 12,
    marginBottom: 14,
  },
  logoBox: {
    width: 82,
    marginRight: 14,
  },
  logo: {
    width: 76,
    height: 42,
    objectFit: "contain",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
  },
  creatorBox: {
    width: 130,
    alignItems: "flex-end",
  },
  creatorText: {
    fontSize: 9,
  },
  section: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: "#F1F1F1",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D8D8",
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionBody: {
    paddingVertical: 7,
    paddingHorizontal: 7,
    minHeight: 28,
  },
  twoColumnRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  leftColumn: {
    width: "62%",
    paddingRight: 5,
  },
  rightColumn: {
    width: "38%",
    paddingLeft: 5,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.45,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 3,
    marginBottom: 2,
  },
  infoLine: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 72,
    fontSize: 10,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    left: 46,
    right: 46,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#D8D8D8",
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCompany: {
    fontSize: 8,
    width: "72%",
  },
  footerMeta: {
    fontSize: 8,
    width: "28%",
    textAlign: "right",
  },
});