"use client"

import { Bold, Italic, Underline, List, Pilcrow, IndentIncrease, IndentDecrease } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FONT_FAMILIES, FONT_SIZES } from "./rich-text"
import type { LineKind } from "@/lib/meeting-notes/types"

export function FormattingToolbar({
  kind,
  indent,
  onToggleKind,
  onIndent,
  onBold,
  onItalic,
  onUnderline,
  onFontFamily,
  onFontSize,
}: {
  kind: LineKind
  indent: number
  onToggleKind: () => void
  onIndent: (delta: 1 | -1) => void
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onFontFamily: (value: string) => void
  onFontSize: (value: number) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-lg border bg-popover p-1 shadow-sm"
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button type="button" size="icon" variant="ghost" className="size-7" onClick={onBold} aria-label="굵게">
        <Bold className="size-3.5" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="size-7" onClick={onItalic} aria-label="기울임">
        <Italic className="size-3.5" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="size-7" onClick={onUnderline} aria-label="밑줄">
        <Underline className="size-3.5" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <select
        className="h-7 rounded-md border bg-transparent px-1 text-xs"
        defaultValue=""
        onChange={(e) => onFontFamily(e.target.value)}
        aria-label="글꼴"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        className="h-7 rounded-md border bg-transparent px-1 text-xs"
        defaultValue=""
        onChange={(e) => onFontSize(Number(e.target.value))}
        aria-label="글자 크기"
      >
        <option value="" disabled>
          크기
        </option>
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7"
        onClick={onToggleKind}
        aria-label={kind === "bullet" ? "문단으로 바꾸기" : "글머리 목록으로 바꾸기"}
      >
        {kind === "bullet" ? <Pilcrow className="size-3.5" /> : <List className="size-3.5" />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7"
        disabled={indent <= 0}
        onClick={() => onIndent(-1)}
        aria-label="내어쓰기"
      >
        <IndentDecrease className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7"
        disabled={indent >= 3}
        onClick={() => onIndent(1)}
        aria-label="들여쓰기"
      >
        <IndentIncrease className="size-3.5" />
      </Button>
    </div>
  )
}
