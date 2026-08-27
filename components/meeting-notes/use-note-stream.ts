"use client"

import { useEffect, useRef, useState } from "react"

import type {
  CursorPosition,
  Line,
  MeetingNoteSnapshot,
  MeetingStatus,
  Participant,
} from "@/lib/meeting-notes/types"

const CURSOR_STALE_MS = 10_000

export function useNoteStream(slug: string) {
  const [note, setNote] = useState<MeetingNoteSnapshot | null>(null)
  const [connected, setConnected] = useState(false)
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
  const noteRef = useRef<MeetingNoteSnapshot | null>(null)

  useEffect(() => {
    const source = new EventSource(`/api/meeting-notes/${encodeURIComponent(slug)}/stream`)

    const update = (fn: (prev: MeetingNoteSnapshot) => MeetingNoteSnapshot) => {
      if (!noteRef.current) return
      const next = fn(noteRef.current)
      noteRef.current = next
      setNote(next)
    }

    source.addEventListener("snapshot", (event) => {
      const snapshot = JSON.parse(event.data) as MeetingNoteSnapshot
      noteRef.current = snapshot
      setNote(snapshot)
      setConnected(true)
    })

    source.addEventListener("participant-joined", (event) => {
      const data = JSON.parse(event.data) as { participant: Participant }
      update((prev) => {
        if (prev.participants.some((p) => p.id === data.participant.id)) return prev
        return {
          ...prev,
          participants: [...prev.participants, data.participant],
          usedColors: [...prev.usedColors, data.participant.color],
        }
      })
    })

    source.addEventListener("line-created", (event) => {
      const data = JSON.parse(event.data) as { line: Line; index: number }
      update((prev) => {
        const lines = [...prev.lines]
        lines.splice(data.index, 0, data.line)
        return { ...prev, lines }
      })
    })

    source.addEventListener("line-updated", (event) => {
      const data = JSON.parse(event.data) as { line: Line }
      update((prev) => ({
        ...prev,
        lines: prev.lines.map((line) => (line.id === data.line.id ? data.line : line)),
      }))
    })

    source.addEventListener("line-locked", (event) => {
      const data = JSON.parse(event.data) as { lineId: string; lock: Line["lock"] }
      update((prev) => ({
        ...prev,
        lines: prev.lines.map((line) => (line.id === data.lineId ? { ...line, lock: data.lock } : line)),
      }))
    })

    source.addEventListener("line-unlocked", (event) => {
      const data = JSON.parse(event.data) as { lineId: string }
      update((prev) => ({
        ...prev,
        lines: prev.lines.map((line) => (line.id === data.lineId ? { ...line, lock: null } : line)),
      }))
    })

    source.addEventListener("confirmations-changed", (event) => {
      const data = JSON.parse(event.data) as {
        meetingEnded: boolean
        confirmedParticipantIds: string[]
      }
      update((prev) => ({
        ...prev,
        meetingEnded: data.meetingEnded,
        confirmedParticipantIds: data.confirmedParticipantIds,
      }))
    })

    source.addEventListener("status-changed", (event) => {
      const data = JSON.parse(event.data) as { status: MeetingStatus; sentAt: number | null }
      update((prev) => ({ ...prev, status: data.status, sentAt: data.sentAt }))
    })

    source.addEventListener("cursor-moved", (event) => {
      const data = JSON.parse(event.data) as CursorPosition
      setCursors((prev) => ({ ...prev, [data.participantId]: data }))
    })

    source.onerror = () => setConnected(false)

    return () => source.close()
  }, [slug])

  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - CURSOR_STALE_MS
      setCursors((prev) => {
        const next: Record<string, CursorPosition> = {}
        let changed = false
        for (const [id, cursor] of Object.entries(prev)) {
          if (cursor.at >= cutoff) {
            next[id] = cursor
          } else {
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1_000)
    return () => clearInterval(interval)
  }, [])

  return { note, connected, cursors }
}
