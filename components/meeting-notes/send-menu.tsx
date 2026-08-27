"use client"

import { useState } from "react"
import { Check, Clipboard, Mail, Send } from "lucide-react"

import { Button } from "@/components/ui/button"

const UNAVAILABLE_REASON = "사내 메일 서버에 접근할 수 없어 지금은 쓸 수 없습니다."

export function SendMenu({
  onSendClipboard,
}: {
  onSendClipboard: () => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClipboard() {
    setPending(true)
    setError(null)
    try {
      const text = await onSendClipboard()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Send className="size-3.5" />
        회의록 전송
      </Button>
      {open ? (
        <div className="absolute right-0 z-10 mt-1 flex w-56 flex-col gap-1 rounded-lg border bg-popover p-1 shadow-md">
          <button
            type="button"
            disabled={pending}
            onClick={handleClipboard}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50"
          >
            {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
            {copied ? "클립보드에 복사됨" : "클립보드"}
          </button>
          <button
            type="button"
            disabled
            title={UNAVAILABLE_REASON}
            aria-label={`Teams — ${UNAVAILABLE_REASON}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground opacity-50"
          >
            <Send className="size-4" />
            Teams
          </button>
          <button
            type="button"
            disabled
            title={UNAVAILABLE_REASON}
            aria-label={`메일 — ${UNAVAILABLE_REASON}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground opacity-50"
          >
            <Mail className="size-4" />
            메일
          </button>
          {error ? <p className="px-2 py-1 text-xs text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
