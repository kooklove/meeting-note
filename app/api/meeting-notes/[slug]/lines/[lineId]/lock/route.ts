import { lockLine } from "@/lib/meeting-notes/store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; lineId: string }> }
) {
  const { slug, lineId } = await params
  const body = await request.json().catch(() => null)
  const participantId = typeof body?.participantId === "string" ? body.participantId : ""

  if (!participantId) {
    return Response.json({ error: "PARTICIPANT_REQUIRED" }, { status: 400 })
  }

  const result = lockLine(decodeURIComponent(slug), lineId, participantId)
  if (!result.ok) {
    return Response.json({ error: "LOCKED", lockedBy: result.lockedBy }, { status: 409 })
  }

  return Response.json({ ok: true })
}
