import { moveCursor } from "@/lib/meeting-notes/store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => null)
  const participantId = typeof body?.participantId === "string" ? body.participantId : ""
  const x = typeof body?.x === "number" ? body.x : null
  const y = typeof body?.y === "number" ? body.y : null

  if (!participantId || x === null || y === null) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 })
  }

  moveCursor(decodeURIComponent(slug), participantId, x, y)
  return Response.json({ ok: true })
}
