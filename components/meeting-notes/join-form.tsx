"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PARTICIPANT_COLORS, HOST_DEFAULT_COLOR, pickDefaultColor } from "@/lib/meeting-notes/colors"
import { cn } from "@/lib/utils"
import type { Participant } from "@/lib/meeting-notes/types"

function displayName(name: string) {
  return name.length > 4 ? name.slice(0, 4) : name
}

export function JoinForm({
  slug,
  usedColors,
  isFirstParticipant,
  onJoined,
}: {
  slug: string
  usedColors: string[]
  isFirstParticipant: boolean
  onJoined: (sessionId: string, participant: Participant) => void
}) {
  const defaultColor = useMemo(
    () => pickDefaultColor(usedColors, isFirstParticipant) ?? PARTICIPANT_COLORS[0],
    [usedColors, isFirstParticipant]
  )
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [org, setOrg] = useState("")
  const [abbr, setAbbr] = useState("")
  const [color, setColor] = useState(defaultColor)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [sessionInput, setSessionInput] = useState("")
  const [rejoinPending, setRejoinPending] = useState(false)
  const [rejoinError, setRejoinError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, org, abbr, color }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          data?.error === "COLOR_TAKEN"
            ? "이미 다른 참석자가 쓰고 있는 색입니다. 다른 색을 골라 주세요."
            : "참여할 수 없습니다. 잠시 후 다시 시도해 주세요."
        )
        return
      }
      onJoined(data.sessionId, data.participant)
    } finally {
      setPending(false)
    }
  }

  async function handleRejoin(e: React.FormEvent) {
    e.preventDefault()
    setRejoinError(null)
    setRejoinPending(true)
    try {
      const res = await fetch(
        `/api/meeting-notes/${encodeURIComponent(slug)}/participants/${encodeURIComponent(sessionInput.trim())}`
      )
      if (!res.ok) {
        setRejoinError("세션 ID를 찾을 수 없습니다.")
        return
      }
      const data = await res.json()
      onJoined(sessionInput.trim(), data.participant)
    } finally {
      setRejoinPending(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="join-email">email</FieldLabel>
          <Input
            id="join-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="join-name">이름 (선택)</FieldLabel>
          <Input id="join-name" value={name} onChange={(e) => setName(e.target.value)} />
          {name ? (
            <FieldDescription>화면에는 &ldquo;{displayName(name)}&rdquo;로 표시됩니다.</FieldDescription>
          ) : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="join-org">조직 (선택)</FieldLabel>
          <Input id="join-org" value={org} onChange={(e) => setOrg(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="join-abbr">약자 (선택, 3글자)</FieldLabel>
          <Input
            id="join-abbr"
            maxLength={3}
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>색</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANT_COLORS.map((c) => {
              const taken = usedColors.includes(c) && c !== color
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  aria-pressed={color === c}
                  disabled={taken}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-6 rounded-full ring-2 ring-offset-2 ring-offset-background transition disabled:cursor-not-allowed disabled:opacity-30",
                    color === c ? "ring-foreground" : "ring-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              )
            })}
          </div>
          {isFirstParticipant ? (
            <FieldDescription>
              회의록을 만든 참석자에게는 {HOST_DEFAULT_COLOR === color ? "기본으로 " : ""}
              빨간색이 먼저 제안됩니다. 다른 색으로 바꿀 수 있습니다.
            </FieldDescription>
          ) : null}
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "참여하는 중..." : "참여하기"}
        </Button>
      </form>

      <form onSubmit={handleRejoin} className="flex flex-col gap-3 border-t pt-6">
        <FieldLabel htmlFor="session-id">이미 세션 ID가 있으신가요?</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="session-id"
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
            placeholder="세션 ID 붙여넣기"
          />
          <Button type="submit" variant="outline" disabled={!sessionInput || rejoinPending}>
            {rejoinPending ? "확인 중..." : "이 ID로 들어가기"}
          </Button>
        </div>
        {rejoinError ? <p className="text-sm text-destructive">{rejoinError}</p> : null}
      </form>
    </div>
  )
}
