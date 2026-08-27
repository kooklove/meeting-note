"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, PlusIcon } from "lucide-react"

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
import { parseLocalInputValue, toLocalInputValue } from "@/lib/meeting-notes/datetime"
import { suggestSlug } from "@/lib/meeting-notes/slug"

export function CreateNoteDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [scheduledAtInput, setScheduledAtInput] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [inviteEmails, setInviteEmails] = useState("")
  const [agenda, setAgenda] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function recomputeSlug(nextTitle: string, nextScheduledAtInput: string) {
    if (slugTouched) return
    const parsed = parseLocalInputValue(nextScheduledAtInput)
    const date = parsed ? new Date(parsed) : new Date()
    setSlug(suggestSlug(nextTitle, date))
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    recomputeSlug(value, scheduledAtInput)
  }

  function handleScheduledAtChange(value: string) {
    setScheduledAtInput(value)
    recomputeSlug(title, value)
  }

  function handleNow() {
    handleScheduledAtChange(toLocalInputValue(new Date()))
  }

  function resetForm() {
    setTitle("")
    setScheduledAtInput("")
    setSlug("")
    setSlugTouched(false)
    setInviteEmails("")
    setAgenda("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const scheduledAt = parseLocalInputValue(scheduledAtInput)
    if (!scheduledAt) {
      setError("일시를 입력해 주세요.")
      return
    }
    setPending(true)
    try {
      const res = await fetch("/api/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, scheduledAt, inviteEmails, agenda }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(
          data?.error === "SLUG_TAKEN"
            ? "이미 사용 중인 링크 주소입니다. 다른 주소를 입력해 주세요."
            : "회의록을 만들 수 없습니다. 제목과 일시를 확인해 주세요."
        )
        return
      }
      resetForm()
      setOpen(false)
      router.push(`/notes/${encodeURIComponent(slug)}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) resetForm()
      }}
    >
      <DialogTrigger render={<Button className="w-full" />}>
        <PlusIcon data-icon="inline-start" />
        새 회의록
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 회의록 만들기</DialogTitle>
            <DialogDescription>
              제목과 일시는 필수입니다. 나머지는 나중에도 채울 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="note-title">제목</FieldLabel>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="3분기 로드맵 킥오프"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="note-scheduled-at">일시</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleNow}
                  aria-label="지금 시각으로 채우기"
                  title="지금 시각으로 채우기"
                >
                  <Clock className="size-4" />
                </Button>
                <Input
                  id="note-scheduled-at"
                  type="datetime-local"
                  step={60}
                  value={scheduledAtInput}
                  onChange={(e) => handleScheduledAtChange(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="note-invite-emails">초대 대상 (선택)</FieldLabel>
              <Textarea
                id="note-invite-emails"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="쉼표나 줄바꿈으로 구분해 email을 입력하세요"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="note-agenda">논의할 내용 (선택)</FieldLabel>
              <Textarea
                id="note-agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="이번 회의에서 다룰 안건을 적어주세요."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="note-slug">링크 주소</FieldLabel>
              <Input
                id="note-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
                required
              />
            </Field>
          </FieldGroup>
          {error ? <p className="px-1 text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>취소</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "만드는 중..." : "회의록 만들기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
