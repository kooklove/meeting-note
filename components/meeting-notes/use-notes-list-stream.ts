"use client"

import { useEffect, useState } from "react"

import type { MeetingNoteSummary, MeetingStatus } from "@/lib/meeting-notes/types"

export function useNotesListStream() {
  const [notes, setNotes] = useState<MeetingNoteSummary[] | null>(null)

  useEffect(() => {
    const source = new EventSource("/api/meeting-notes/stream")

    source.addEventListener("notes", (event) => {
      setNotes(JSON.parse(event.data) as MeetingNoteSummary[])
    })

    source.addEventListener("note-created", (event) => {
      const data = JSON.parse(event.data) as { note: MeetingNoteSummary }
      setNotes((prev) => {
        if (!prev) return [data.note]
        if (prev.some((n) => n.slug === data.note.slug)) return prev
        return [data.note, ...prev]
      })
    })

    source.addEventListener("note-status-changed", (event) => {
      const data = JSON.parse(event.data) as { slug: string; status: MeetingStatus }
      setNotes((prev) =>
        prev
          ? prev.map((n) => (n.slug === data.slug ? { ...n, status: data.status } : n))
          : prev
      )
    })

    return () => source.close()
  }, [])

  return notes
}
