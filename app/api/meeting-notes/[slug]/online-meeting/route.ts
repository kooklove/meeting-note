import { setOnlineMeetingUrl } from "@/lib/meeting-notes/store"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json()
  const result = setOnlineMeetingUrl(decodeURIComponent(slug), body.onlineMeetingUrl ?? null)
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 404 })
  }
  return Response.json(result)
}
