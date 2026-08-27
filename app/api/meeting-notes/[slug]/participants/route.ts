import { joinParticipant } from "@/lib/meeting-notes/store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""

  if (!email) {
    return Response.json({ error: "EMAIL_REQUIRED" }, { status: 400 })
  }

  const result = joinParticipant(decodeURIComponent(slug), {
    email,
    name: body?.name ?? null,
    org: body?.org ?? null,
    abbr: body?.abbr ?? null,
    color: body?.color ?? null,
  })

  if ("error" in result) {
    const status = result.error === "NOTE_NOT_FOUND" ? 404 : 409
    return Response.json({ error: result.error }, { status })
  }

  return Response.json(
    { sessionId: result.participant.id, participant: result.participant },
    { status: 201 }
  )
}
