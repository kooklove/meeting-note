import { getNote, getSnapshot, subscribe } from "@/lib/meeting-notes/store"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  if (!getNote(decodedSlug)) {
    return Response.json({ error: "NOTE_NOT_FOUND" }, { status: 404 })
  }

  const encoder = new TextEncoder()
  let unsubscribe: () => void = () => {}
  let heartbeat: ReturnType<typeof setInterval>

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      send("snapshot", getSnapshot(decodedSlug))
      unsubscribe = subscribe(decodedSlug, (event) => send(event.type, event))
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`))
      }, 15_000)
    },
    cancel() {
      unsubscribe()
      clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
