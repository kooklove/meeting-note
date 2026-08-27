import { createLine } from "@/lib/meeting-notes/store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => null)
  const participantId = typeof body?.participantId === "string" ? body.participantId : ""

  if (!participantId) {
    return Response.json({ error: "PARTICIPANT_REQUIRED" }, { status: 400 })
  }

  const result = createLine(decodeURIComponent(slug), {
    afterLineId: body?.afterLineId ?? null,
    kind: body?.kind === "bullet" ? "bullet" : "paragraph",
    indent: typeof body?.indent === "number" ? body.indent : 0,
    participantId,
  })

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 404 })
  }

  return Response.json({ line: result.line, index: result.index }, { status: 201 })
}
