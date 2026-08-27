"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { suggestSlug } from "@/lib/meeting-notes/slug"

export function CreateNoteForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState(() => suggestSlug(""))
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(suggestSlug(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error === "SLUG_TAKEN") {
          setError("이미 사용 중인 링크 주소입니다. 다른 주소를 입력해 주세요.")
        } else if (data?.error === "INVALID_SLUG") {
          setError("링크 주소에 공백이나 슬래시를 쓸 수 없습니다.")
        } else {
          setError("제목을 입력해 주세요.")
        }
        return
      }
      router.push(`/notes/${encodeURIComponent(slug)}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="note-title">회의록 제목</FieldLabel>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="3분기 로드맵 킥오프"
          required
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
        <FieldDescription>
          `20260826_1530_Title` 형식을 권장합니다. 다른 참석자가 이 주소로 들어옵니다.
        </FieldDescription>
      </Field>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "만드는 중..." : "회의록 만들기"}
      </Button>
    </form>
  )
}
