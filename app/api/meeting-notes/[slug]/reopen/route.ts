import { setMeetingEnded } from "@/lib/meeting-notes/store"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const result = setMeetingEnded(decodeURIComponent(slug), false)
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 404 })
  }
  return Response.json(result)
}
