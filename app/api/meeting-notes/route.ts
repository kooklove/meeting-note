import { NextRequest } from "next/server"

import { createNote, listNotes } from "@/lib/meeting-notes/store"
import { isValidSlug } from "@/lib/meeting-notes/slug"

function parseEmails(value: unknown): string[] {
  if (typeof value !== "string") return []
  return value
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter(Boolean)
}

export async function GET() {
  return Response.json({ notes: listNotes() })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const slug = typeof body?.slug === "string" ? body.slug.trim() : ""
  const scheduledAt = typeof body?.scheduledAt === "number" ? body.scheduledAt : null

  if (!title) {
    return Response.json({ error: "TITLE_REQUIRED" }, { status: 400 })
  }
  if (!scheduledAt || Number.isNaN(scheduledAt)) {
    return Response.json({ error: "SCHEDULED_AT_REQUIRED" }, { status: 400 })
  }
  if (!slug || !isValidSlug(slug)) {
    return Response.json({ error: "INVALID_SLUG" }, { status: 400 })
  }

  try {
    const snapshot = createNote({
      title,
      slug,
      scheduledAt,
      agenda: typeof body?.agenda === "string" ? body.agenda : null,
      inviteEmails: parseEmails(body?.inviteEmails),
    })
    return Response.json({ note: snapshot }, { status: 201 })
  } catch {
    return Response.json({ error: "SLUG_TAKEN" }, { status: 409 })
  }
}
