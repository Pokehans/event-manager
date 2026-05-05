import { pdf } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { EventRunSheetsPdf } from "@/components/events/event-run-sheet-pdf";
import { getEventsByIds } from "@/lib/events/get-events-by-ids";

export const runtime = "nodejs";

const MAX_PRINT_EVENTS = 30;

function parseIds(value: string | null) {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_PRINT_EVENTS);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = parseIds(searchParams.get("ids"));

  if (ids.length === 0) {
    notFound();
  }

  const events = await getEventsByIds(ids);

  if (events.length === 0) {
    notFound();
  }

  const pdfStream = await pdf(
    <EventRunSheetsPdf events={events} />
  ).toBuffer();

  const chunks: Uint8Array[] = [];

  for await (const chunk of pdfStream) {
    chunks.push(chunk instanceof Uint8Array ? chunk : Buffer.from(chunk));
  }

  const pdfBuffer = Buffer.concat(chunks);

  const now = new Date();
  const formattedDate = now
    .toLocaleDateString("de-CH")
    .replace(/\./g, "-");

  const filename = `laufzettel-${formattedDate}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}