"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SessionBadge({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
      <span>세션 ID</span>
      <code className="max-w-40 truncate font-mono">{sessionId}</code>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-5"
        onClick={handleCopy}
        aria-label="세션 ID 복사"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
    </div>
  )
}
