"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { participantLabel } from "@/lib/meeting-notes/participant-label"
import type { MeetingNoteSnapshot, Participant } from "@/lib/meeting-notes/types"

export function MeetingWrapUp({
  note,
  me,
  onEndMeeting,
  onReopenMeeting,
  onConfirm,
}: {
  note: MeetingNoteSnapshot
  me: Participant
  onEndMeeting: () => Promise<void>
  onReopenMeeting: () => Promise<void>
  onConfirm: (confirmed: boolean) => void
}) {
  const [pending, setPending] = useState(false)

  async function handleToggleEnd() {
    setPending(true)
    try {
      if (note.meetingEnded) await onReopenMeeting()
      else await onEndMeeting()
    } finally {
      setPending(false)
    }
  }

  const confirmedIds = new Set(note.confirmedParticipantIds)
  const iConfirmed = confirmedIds.has(me.id)

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {note.meetingEnded ? "회의가 종료되었습니다" : "회의가 진행 중입니다"}
          </p>
          {note.meetingEnded ? (
            <p className="text-xs text-muted-foreground">
              참석자 {note.participants.length}명 중 {confirmedIds.size}명이 확인했습니다.
            </p>
          ) : null}
        </div>
        <Button variant="outline" size="sm" disabled={pending} onClick={handleToggleEnd}>
          {note.meetingEnded ? "회의 종료 되돌리기" : "회의 종료"}
        </Button>
      </div>

      {note.meetingEnded ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {note.participants.map((p) => {
              const confirmed = confirmedIds.has(p.id)
              return (
                <span
                  key={p.id}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs ring-1 ring-foreground/10"
                  style={{
                    backgroundColor: confirmed ? `${p.color}22` : undefined,
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {participantLabel(p)}
                  {confirmed ? <Check className="size-3" /> : null}
                </span>
              )
            })}
          </div>
          <Button
            size="sm"
            variant={iConfirmed ? "outline" : "default"}
            className="w-fit"
            onClick={() => onConfirm(!iConfirmed)}
          >
            {iConfirmed ? "확인 취소" : "확인"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
