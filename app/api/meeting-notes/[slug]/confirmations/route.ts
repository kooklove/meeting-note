import { setConfirmation } from "@/lib/meeting-notes/store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => null)
  const participantId = typeof body?.participantId === "string" ? body.participantId : ""
  const confirmed = body?.confirmed !== false

  if (!participantId) {
    return Response.json({ error: "PARTICIPANT_REQUIRED" }, { status: 400 })
  }

  const result = setConfirmation(decodeURIComponent(slug), participantId, confirmed)
  if ("error" in result) {
    const status = result.error === "NOT_FOUND" ? 404 : 409
    return Response.json({ error: result.error }, { status })
  }
  return Response.json(result)
}
