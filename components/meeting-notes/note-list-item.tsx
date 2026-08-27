"use client"

import Link from "next/link"

import { NoteStatusBadge } from "./note-status-badge"
import { formatScheduledAt } from "@/lib/meeting-notes/datetime"
import { cn } from "@/lib/utils"
import type { MeetingNoteSummary } from "@/lib/meeting-notes/types"

export function NoteListItem({
  note,
  active,
}: {
  note: MeetingNoteSummary
  active: boolean
}) {
  return (
    <Link
      href={`/notes/${encodeURIComponent(note.slug)}`}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-3 text-sm transition hover:bg-muted",
        active && "border-foreground/30 bg-muted"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{note.title}</span>
        <NoteStatusBadge status={note.status} />
      </div>
      <span className="text-xs text-muted-foreground">{formatScheduledAt(note.scheduledAt)}</span>
      {note.agenda ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">{note.agenda}</p>
      ) : null}
    </Link>
  )
}
