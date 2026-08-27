import { getParticipant } from "@/lib/meeting-notes/store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
) {
  const { slug, sessionId } = await params
  const participant = getParticipant(decodeURIComponent(slug), sessionId)
  if (!participant) {
    return Response.json({ error: "SESSION_NOT_FOUND" }, { status: 404 })
  }
  return Response.json({ participant })
}
