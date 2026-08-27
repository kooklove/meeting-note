import { updateLine } from "@/lib/meeting-notes/store"
import type { Run } from "@/lib/meeting-notes/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; lineId: string }> }
) {
  const { slug, lineId } = await params
  const body = await request.json().catch(() => null)
  const participantId = typeof body?.participantId === "string" ? body.participantId : ""
  const runs = Array.isArray(body?.runs) ? (body.runs as Run[]) : null

  if (!participantId || !runs) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 })
  }

  const result = updateLine(decodeURIComponent(slug), lineId, {
    participantId,
    runs,
    kind: body?.kind === "bullet" || body?.kind === "paragraph" ? body.kind : undefined,
    indent: typeof body?.indent === "number" ? body.indent : undefined,
  })

  if ("error" in result) {
    const status = result.error === "NOT_FOUND" ? 404 : 409
    return Response.json({ error: result.error }, { status })
  }

  return Response.json({ line: result.line })
}
