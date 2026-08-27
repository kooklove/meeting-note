"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function StubMenuButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    if (!showNotice) return
    const timer = setTimeout(() => setShowNotice(false), 1800)
    return () => clearTimeout(timer)
  }, [showNotice])

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        title={label}
        onClick={() => setShowNotice(true)}
      >
        <Icon className="size-4" />
      </Button>
      {showNotice ? (
        <div className="absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs text-muted-foreground shadow-md">
          {label} — 준비 중입니다
        </div>
      ) : null}
    </div>
  )
}
