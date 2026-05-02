import { pdf } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { EventRunSheetPdf } from "@/components/events/event-run-sheet-pdf";
import { getEventById } from "@/lib/events/get-event-by-id";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const pdfStream = await pdf(<EventRunSheetPdf event={event} />).toBuffer();
    const chunks: Uint8Array[] = [];

    for await (const chunk of pdfStream) {
    chunks.push(chunk instanceof Uint8Array ? chunk : Buffer.from(chunk));
    }

    const pdfBuffer = Buffer.concat(chunks);

  const filename = `laufzettel-${sanitizeFilename(event.title)}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}