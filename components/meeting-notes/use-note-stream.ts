"use client"

import { useEffect, useRef, useState } from "react"

import type { Line, MeetingNoteSnapshot, Participant } from "@/lib/meeting-notes/types"

export function useNoteStream(slug: string) {
  const [note, setNote] = useState<MeetingNoteSnapshot | null>(null)
  const [connected, setConnected] = useState(false)
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

    source.onerror = () => setConnected(false)

    return () => source.close()
  }, [slug])

  return { note, connected }
}
