import { sendNote, type SendMethod } from "@/lib/meeting-notes/store"

const METHODS: SendMethod[] = ["clipboard", "teams", "mail"]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json().catch(() => null)
  const method = METHODS.includes(body?.method) ? (body.method as SendMethod) : null

  if (!method) {
    return Response.json({ error: "INVALID_METHOD" }, { status: 400 })
  }
  if (method !== "clipboard") {
    return Response.json({ error: "METHOD_UNAVAILABLE" }, { status: 501 })
  }

  const result = sendNote(decodeURIComponent(slug))
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 404 })
  }
  return Response.json(result)
}
