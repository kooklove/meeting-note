"use client"

import { useEffect, useState } from "react"

import { JoinForm } from "./join-form"
import { NoteEditor } from "./note-editor"
import { useNoteStream } from "./use-note-stream"
import type { Line, Participant } from "@/lib/meeting-notes/types"

type Phase = "checking" | "not-found" | "join" | "ready"

export function NoteApp({ slug }: { slug: string }) {
  const storageKey = `meeting-note:${slug}:sessionId`
  const { note, cursors } = useNoteStream(slug)

  const [phase, setPhase] = useState<Phase>("checking")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [me, setMe] = useState<Participant | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const noteRes = await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}`)
      if (cancelled) return
      if (!noteRes.ok) {
        setPhase("not-found")
        return
      }

      const saved = window.localStorage.getItem(storageKey)
      if (!saved) {
        setPhase("join")
        return
      }

      const sessionRes = await fetch(
        `/api/meeting-notes/${encodeURIComponent(slug)}/participants/${encodeURIComponent(saved)}`
      )
      if (cancelled) return
      if (!sessionRes.ok) {
        window.localStorage.removeItem(storageKey)
        setPhase("join")
        return
      }

      const data = await sessionRes.json()
      if (cancelled) return
      setSessionId(saved)
      setMe(data.participant)
      setPhase("ready")
    }

    bootstrap().catch(() => {
      if (!cancelled) setPhase("not-found")
    })

    return () => {
      cancelled = true
    }
  }, [slug, storageKey])

  function handleJoined(id: string, participant: Participant) {
    window.localStorage.setItem(storageKey, id)
    setSessionId(id)
    setMe(participant)
    setPhase("ready")
  }

  async function handleLock(lineId: string) {
    if (!sessionId) return false
    const res = await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/lines/${lineId}/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: sessionId }),
    })
    return res.ok
  }

  function handleUnlock(lineId: string) {
    if (!sessionId) return
    fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/lines/${lineId}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: sessionId }),
    })
  }

  function handleChangeLine(
    lineId: string,
    patch: { runs: Line["runs"]; kind?: Line["kind"]; indent?: number }
  ) {
    if (!sessionId) return
    fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/lines/${lineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: sessionId, ...patch }),
    })
  }

  function handleCreateLine(afterLineId: string | null) {
    if (!sessionId) return
    fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: sessionId, afterLineId }),
    })
  }

  async function handleEndMeeting() {
    await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/end`, { method: "POST" })
  }

  async function handleReopenMeeting() {
    await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/reopen`, { method: "POST" })
  }

  function handleConfirm(confirmed: boolean) {
    if (!sessionId) return
    fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/confirmations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: sessionId, confirmed }),
    })
  }

  async function handleSendClipboard(): Promise<string> {
    const res = await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "clipboard" }),
    })
    if (!res.ok) throw new Error("SEND_FAILED")
    const data = await res.json()
    return data.text as string
  }

  if (phase === "checking") {
    return <p className="py-20 text-center text-sm text-muted-foreground">불러오는 중...</p>
  }
  if (phase === "not-found") {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        이 링크의 회의록을 찾을 수 없습니다.
      </p>
    )
  }
  if (phase === "join" || !note) {
    if (!note) {
      return <p className="py-20 text-center text-sm text-muted-foreground">불러오는 중...</p>
    }
    return (
      <div className="flex justify-center py-16">
        <JoinForm
          slug={slug}
          usedColors={note.usedColors}
          isFirstParticipant={note.participants.length === 0}
          onJoined={handleJoined}
        />
      </div>
    )
  }
  if (!me || !sessionId) {
    return <p className="py-20 text-center text-sm text-muted-foreground">불러오는 중...</p>
  }

  return (
    <div className="flex flex-1 justify-center px-4">
      <NoteEditor
        note={note}
        me={me}
        sessionId={sessionId}
        cursors={cursors}
        onLock={handleLock}
        onUnlock={handleUnlock}
        onChangeLine={handleChangeLine}
        onCreateLine={handleCreateLine}
        onEndMeeting={handleEndMeeting}
        onReopenMeeting={handleReopenMeeting}
        onConfirm={handleConfirm}
        onSendClipboard={handleSendClipboard}
      />
    </div>
  )
}
