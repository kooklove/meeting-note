"use client"

import { useState, type FormEvent } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { MeetingNote } from "./types"

function parseParticipants(value: string) {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
}

export function CreateMeetingNoteDialog({
  onCreate,
}: {
  onCreate: (note: MeetingNote) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [participants, setParticipants] = useState("")
  const [summary, setSummary] = useState("")

  const isValid = title.trim().length > 0 && date.trim().length > 0

  function resetForm() {
    setTitle("")
    setDate("")
    setParticipants("")
    setSummary("")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid) return

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      participants: parseParticipants(participants),
      summary: summary.trim(),
    })

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) resetForm()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        새 회의록
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 회의록 작성</DialogTitle>
            <DialogDescription>
              회의 내용을 기록하면 목록에 바로 추가됩니다.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="meeting-title">제목</FieldLabel>
              <Input
                id="meeting-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 3분기 로드맵 킥오프"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-date">일시</FieldLabel>
              <Input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-participants">참석자</FieldLabel>
              <Input
                id="meeting-participants"
                value={participants}
                onChange={(event) => setParticipants(event.target.value)}
                placeholder="쉼표로 구분해 입력하세요 (예: 김서연, 박도윤)"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="meeting-summary">요약</FieldLabel>
              <Textarea
                id="meeting-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="논의한 내용과 다음 액션을 적어주세요."
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              취소
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
