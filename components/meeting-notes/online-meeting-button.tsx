"use client"

import { VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { MeetingNoteSnapshot } from "@/lib/meeting-notes/types"

export function OnlineMeetingButton({
  note,
  onOpenSettings,
}: {
  note: MeetingNoteSnapshot
  onOpenSettings: () => void
}) {
  function handleClick() {
    if (note.onlineMeetingUrl) {
      window.open(note.onlineMeetingUrl, "_blank", "noopener,noreferrer")
    } else {
      onOpenSettings()
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="온라인 미팅 조인"
      title={note.onlineMeetingUrl ? "온라인 미팅 조인" : "등록된 온라인 미팅 정보가 없습니다"}
      onClick={handleClick}
    >
      <VideoIcon className="size-4" />
    </Button>
  )
}
