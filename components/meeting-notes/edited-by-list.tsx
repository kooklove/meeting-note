import { participantLabel } from "@/lib/meeting-notes/participant-label"
import type { MeetingNoteSnapshot } from "@/lib/meeting-notes/types"

export function EditedByList({ note }: { note: MeetingNoteSnapshot }) {
  const editedIds = new Set(note.lines.flatMap((line) => line.authorIds))
  const editors = note.participants.filter((p) => editedIds.has(p.id))

  if (editors.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2 text-xs text-muted-foreground">
      <span>고친 참석자</span>
      {editors.map((p) => (
        <span
          key={p.id}
          className="flex items-center gap-1.5 rounded-full bg-background px-2 py-1 ring-1 ring-foreground/10"
        >
          <span className="size-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          {participantLabel(p)}
        </span>
      ))}
    </div>
  )
}
