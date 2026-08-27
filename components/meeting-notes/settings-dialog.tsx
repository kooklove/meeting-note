"use client"

import { useState } from "react"
import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { MeetingNoteSnapshot } from "@/lib/meeting-notes/types"

export function SettingsDialog({
  open,
  onOpenChange,
  note,
  onUpdateOnlineMeetingUrl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: MeetingNoteSnapshot
  onUpdateOnlineMeetingUrl: (url: string) => void
}) {
  const [urlInput, setUrlInput] = useState(note.onlineMeetingUrl ?? "")

  function handleOpenChange(next: boolean) {
    if (next) setUrlInput(note.onlineMeetingUrl ?? "")
    onOpenChange(next)
  }

  function handleSave() {
    onUpdateOnlineMeetingUrl(urlInput)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="size-4" />
            설정
          </DialogTitle>
          <DialogDescription>이 회의록에 대한 설정입니다.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="online-meeting-url">Teams 등 온라인 미팅 정보</FieldLabel>
            <Input
              id="online-meeting-url"
              placeholder="https://teams.microsoft.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>사용자 이름 변경</FieldLabel>
            <p className="text-sm text-muted-foreground">준비 중입니다.</p>
          </Field>
          <Field>
            <FieldLabel>조직 약자 등록</FieldLabel>
            <p className="text-sm text-muted-foreground">준비 중입니다.</p>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
