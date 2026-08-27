import { getSnapshot } from "@/lib/meeting-notes/store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const note = getSnapshot(decodeURIComponent(slug))
  if (!note) {
    return Response.json({ error: "NOTE_NOT_FOUND" }, { status: 404 })
  }
  return Response.json({ note })
}
