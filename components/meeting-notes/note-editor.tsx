"use client"

import { useRef, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditedByList } from "./edited-by-list"
import { MeetingWrapUp } from "./meeting-wrap-up"
import { NoteLine } from "./note-line"
import { NoteStatusBadge } from "./note-status-badge"
import { PrimaryToolbar } from "./primary-toolbar"
import { RemoteCursors } from "./remote-cursors"
import { SessionBadge } from "./session-badge"
import { useCursorBroadcast } from "./use-cursor-broadcast"
import { useMyHighlightPreference } from "./use-my-highlight-preference"
import { formatScheduledAt } from "@/lib/meeting-notes/datetime"
import type { CursorPosition, Line, MeetingNoteSnapshot, Participant } from "@/lib/meeting-notes/types"

function authorKey(line: Line) {
  return line.authorIds[0] ?? null
}

export function NoteEditor({
  note,
  me,
  sessionId,
  cursors,
  onLock,
  onUnlock,
  onChangeLine,
  onCreateLine,
  onEndMeeting,
  onReopenMeeting,
  onConfirm,
  onSendClipboard,
  onUpdateOnlineMeetingUrl,
}: {
  note: MeetingNoteSnapshot
  me: Participant
  sessionId: string
  cursors: Record<string, CursorPosition>
  onLock: (lineId: string) => Promise<boolean>
  onUnlock: (lineId: string) => void
  onChangeLine: (lineId: string, patch: { runs: Line["runs"]; kind?: Line["kind"]; indent?: number }) => void
  onCreateLine: (afterLineId: string | null) => void
  onEndMeeting: () => Promise<void>
  onReopenMeeting: () => Promise<void>
  onConfirm: (confirmed: boolean) => void
  onSendClipboard: () => Promise<string>
  onUpdateOnlineMeetingUrl: (url: string) => void
}) {
  const participantsById = Object.fromEntries(note.participants.map((p) => [p.id, p]))
  const containerRef = useRef<HTMLDivElement>(null)
  useCursorBroadcast(note.slug, sessionId, containerRef)

  const { enabled: myHighlightEnabled, toggle: toggleMyHighlight } = useMyHighlightPreference()
  const [highlightModeEnabled, setHighlightModeEnabled] = useState(false)

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 self-center py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{note.title}</h1>
            <NoteStatusBadge status={note.status} />
          </div>
          <p className="text-sm text-muted-foreground">{formatScheduledAt(note.scheduledAt)}</p>
          {note.agenda ? (
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{note.agenda}</p>
          ) : null}
        </div>
        <SessionBadge sessionId={sessionId} />
      </div>

      <PrimaryToolbar
        note={note}
        myHighlightEnabled={myHighlightEnabled}
        onToggleMyHighlight={toggleMyHighlight}
        highlightModeEnabled={highlightModeEnabled}
        onToggleHighlightMode={() => setHighlightModeEnabled((v) => !v)}
        onSendClipboard={onSendClipboard}
        onUpdateOnlineMeetingUrl={onUpdateOnlineMeetingUrl}
      />

      <MeetingWrapUp
        note={note}
        me={me}
        onEndMeeting={onEndMeeting}
        onReopenMeeting={onReopenMeeting}
        onConfirm={onConfirm}
      />

      <div ref={containerRef} className="relative flex flex-col gap-1 rounded-xl border bg-card p-4">
        <RemoteCursors cursors={cursors} participants={participantsById} selfId={sessionId} />
        {note.lines.map((line, index) => {
          const prev = index > 0 ? note.lines[index - 1] : null
          const isNewGroup = !prev || authorKey(prev) !== authorKey(line)

          return (
            <div
              key={line.id}
              className={isNewGroup ? "group/line mt-3 flex flex-col first:mt-0" : "group/line flex flex-col"}
            >
              <NoteLine
                line={line}
                me={me}
                participants={participantsById}
                onLock={onLock}
                onUnlock={onUnlock}
                onChange={onChangeLine}
                myHighlightEnabled={myHighlightEnabled}
                highlightModeEnabled={highlightModeEnabled}
              />
              <button
                type="button"
                onClick={() => onCreateLine(line.id)}
                className="ml-8 flex items-center gap-1 py-0.5 text-[11px] text-muted-foreground opacity-0 transition group-hover/line:opacity-100 hover:text-foreground"
              >
                <Plus className="size-3" />새 줄
              </button>
            </div>
          )
        })}
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

      <EditedByList note={note} />
    </div>
  )
}
