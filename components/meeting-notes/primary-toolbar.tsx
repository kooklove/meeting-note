"use client"

import { useState } from "react"
import { History, Highlighter, Settings, Sparkles, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OnlineMeetingButton } from "./online-meeting-button"
import { SendMenu } from "./send-menu"
import { SettingsDialog } from "./settings-dialog"
import { StubMenuButton } from "./stub-menu-button"
import type { MeetingNoteSnapshot } from "@/lib/meeting-notes/types"

export function PrimaryToolbar({
  note,
  myHighlightEnabled,
  onToggleMyHighlight,
  highlightModeEnabled,
  onToggleHighlightMode,
  onSendClipboard,
  onUpdateOnlineMeetingUrl,
}: {
  note: MeetingNoteSnapshot
  myHighlightEnabled: boolean
  onToggleMyHighlight: () => void
  highlightModeEnabled: boolean
  onToggleHighlightMode: () => void
  onSendClipboard: () => Promise<string>
  onUpdateOnlineMeetingUrl: (url: string) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1">
      <StubMenuButton icon={UserPlus} label="초대 보내기" />
      <SendMenu onSendClipboard={onSendClipboard} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="내가 쓴 내용 강조"
        title="내가 쓴 내용 강조"
        onClick={onToggleMyHighlight}
        className={cn(myHighlightEnabled && "bg-accent text-accent-foreground")}
      >
        <Sparkles className="size-4" />
      </Button>

      <StubMenuButton icon={History} label="변경 내용 보여주기" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="강조 표시"
        title="강조 표시 — 켠 채로 본문을 드래그하면 칠해집니다"
        onClick={onToggleHighlightMode}
        className={cn(highlightModeEnabled && "bg-accent text-accent-foreground")}
      >
        <Highlighter className="size-4" />
      </Button>

      <OnlineMeetingButton note={note} onOpenSettings={() => setSettingsOpen(true)} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="설정"
        title="설정"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="size-4" />
      </Button>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        note={note}
        onUpdateOnlineMeetingUrl={onUpdateOnlineMeetingUrl}
      />
    </div>
  )
}
