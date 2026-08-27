import { NextRequest } from "next/server"

import { createNote } from "@/lib/meeting-notes/store"
import { isValidSlug } from "@/lib/meeting-notes/slug"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const slug = typeof body?.slug === "string" ? body.slug.trim() : ""

  if (!title) {
    return Response.json({ error: "TITLE_REQUIRED" }, { status: 400 })
  }
  if (!slug || !isValidSlug(slug)) {
    return Response.json({ error: "INVALID_SLUG" }, { status: 400 })
  }

  try {
    const snapshot = createNote(title, slug)
    return Response.json({ note: snapshot }, { status: 201 })
  } catch {
    return Response.json({ error: "SLUG_TAKEN" }, { status: 409 })
  }
}
