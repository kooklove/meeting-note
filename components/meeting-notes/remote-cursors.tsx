"use client"

import { participantLabel } from "@/lib/meeting-notes/participant-label"
import type { CursorPosition, Participant } from "@/lib/meeting-notes/types"

export function RemoteCursors({
  cursors,
  participants,
  selfId,
}: {
  cursors: Record<string, CursorPosition>
  participants: Record<string, Participant>
  selfId: string
}) {
  const entries = Object.values(cursors).filter((c) => c.participantId !== selfId)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {entries.map((cursor) => {
        const participant = participants[cursor.participantId]
        if (!participant) return null
        return (
          <div
            key={cursor.participantId}
            className="absolute -translate-x-0.5 -translate-y-0.5 transition-[left,top] duration-150 ease-linear"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill={participant.color}>
              <path d="M0 0 L14 7 L7 8.5 L5.5 15.5 Z" />
            </svg>
            <span
              className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
              style={{ backgroundColor: participant.color }}
            >
              {participantLabel(participant)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
