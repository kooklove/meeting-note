"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NoteLine } from "./note-line"
import { SessionBadge } from "./session-badge"
import type { Line, MeetingNoteSnapshot, Participant } from "@/lib/meeting-notes/types"

export function NoteEditor({
  note,
  me,
  sessionId,
  onLock,
  onUnlock,
  onChangeLine,
  onCreateLine,
}: {
  note: MeetingNoteSnapshot
  me: Participant
  sessionId: string
  onLock: (lineId: string) => Promise<boolean>
  onUnlock: (lineId: string) => void
  onChangeLine: (lineId: string, patch: { runs: Line["runs"]; kind?: Line["kind"]; indent?: number }) => void
  onCreateLine: (afterLineId: string | null) => void
}) {
  const participantsById = Object.fromEntries(note.participants.map((p) => [p.id, p]))

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{note.title}</h1>
        <SessionBadge sessionId={sessionId} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2">
        {note.participants.map((p) => (
          <span
            key={p.id}
            className="flex items-center gap-1.5 rounded-full bg-background px-2 py-1 text-xs ring-1 ring-foreground/10"
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.abbr || displayName(p.name) || p.email}
            {p.isHost ? <span className="text-muted-foreground">(주최자)</span> : null}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
        {note.lines.map((line) => (
          <div key={line.id} className="group/line flex flex-col">
            <NoteLine
              line={line}
              me={me}
              participants={participantsById}
              onLock={onLock}
              onUnlock={onUnlock}
              onChange={onChangeLine}
            />
            <button
              type="button"
              onClick={() => onCreateLine(line.id)}
              className="ml-8 flex items-center gap-1 py-0.5 text-[11px] text-muted-foreground opacity-0 transition group-hover/line:opacity-100 hover:text-foreground"
            >
              <Plus className="size-3" />새 줄
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-fit"
          onClick={() => onCreateLine(note.lines[note.lines.length - 1]?.id ?? null)}
        >
          <Plus className="size-3.5" />새 줄 추가
        </Button>
      </div>
    </div>
  )
}

function displayName(name: string | null) {
  if (!name) return null
  return name.length > 4 ? name.slice(0, 4) : name
}
