"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { FormattingToolbar } from "./formatting-toolbar"
import { applySelectionStyle, runsToHtml, htmlToRuns } from "./rich-text"
import { cn } from "@/lib/utils"
import type { InlineStyle, Line, Participant } from "@/lib/meeting-notes/types"

const INDENT_PX = 24

export function NoteLine({
  line,
  me,
  participants,
  onLock,
  onUnlock,
  onChange,
}: {
  line: Line
  me: Participant
  participants: Record<string, Participant>
  onLock: (lineId: string) => Promise<boolean>
  onUnlock: (lineId: string) => void
  onChange: (lineId: string, patch: { runs: Line["runs"]; kind?: Line["kind"]; indent?: number }) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [editing, setEditing] = useState(false)

  const isLockedByMe = line.lock?.participantId === me.id
  const isLockedByOther = !!line.lock && !isLockedByMe
  const lockedByParticipant = line.lock ? participants[line.lock.participantId] : null

  useEffect(() => {
    if (editing) return
    const el = contentRef.current
    if (!el) return
    const html = runsToHtml(line.runs)
    if (el.innerHTML !== html) el.innerHTML = html
  }, [line.runs, editing])

  useEffect(() => {
    // 서버가 이미 나에게 lock을 준 줄(예: 방금 내가 만든 새 줄)은 바로 편집 모드로 맞춘다.
    if (isLockedByMe && !editing) {
      Promise.resolve().then(() => setEditing(true))
    }
  }, [isLockedByMe, editing])

  useLayoutEffect(() => {
    if (editing) contentRef.current?.focus()
  }, [editing])

  async function startEditing() {
    if (isLockedByOther) return
    if (editing) return
    const ok = await onLock(line.id)
    if (!ok) return
    setEditing(true)
  }

  function commit() {
    const el = contentRef.current
    if (!el) return
    const runs = htmlToRuns(el)
    onChange(line.id, { runs })
  }

  function stopEditing() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    commit()
    setEditing(false)
    onUnlock(line.id)
  }

  function handleInput() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(commit, 150)
  }

  function saveSelection() {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && contentRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
  }

  function restoreSelection() {
    const el = contentRef.current
    const range = savedRangeRef.current
    if (!el || !range) return
    el.focus()
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function withSelection(mutator: (current: InlineStyle) => InlineStyle) {
    const el = contentRef.current
    if (!el) return
    restoreSelection()
    applySelectionStyle(el, mutator)
    handleInput()
  }

  const authorDots = line.authorIds
    .map((id) => participants[id])
    .filter((p): p is Participant => !!p)

  return (
    <div className="group relative flex items-start gap-2" style={{ paddingLeft: line.indent * INDENT_PX }}>
      <div className="flex w-8 shrink-0 flex-col items-end pt-1.5">
        {authorDots.map((p, i) => (
          <span
            key={p.id + i}
            title={p.name || p.email}
            className="-mt-1 size-[9px] rounded-full ring-1 ring-background first:mt-0"
            style={{ backgroundColor: p.color, zIndex: 3 - i }}
          />
        ))}
      </div>

      {line.kind === "bullet" ? (
        <span className="pt-1.5 text-muted-foreground select-none">•</span>
      ) : null}

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="mb-1">
            <FormattingToolbar
              kind={line.kind}
              indent={line.indent}
              onToggleKind={() =>
                onChange(line.id, {
                  runs: htmlToRuns(contentRef.current!),
                  kind: line.kind === "bullet" ? "paragraph" : "bullet",
                })
              }
              onIndent={(delta) =>
                onChange(line.id, {
                  runs: htmlToRuns(contentRef.current!),
                  indent: line.indent + delta,
                })
              }
              onBold={() => withSelection((s) => ({ ...s, bold: !s.bold }))}
              onItalic={() => withSelection((s) => ({ ...s, italic: !s.italic }))}
              onUnderline={() => withSelection((s) => ({ ...s, underline: !s.underline }))}
              onFontFamily={(value) =>
                withSelection((s) => ({ ...s, fontFamily: value || undefined }))
              }
              onFontSize={(value) => withSelection((s) => ({ ...s, fontSize: value }))}
            />
          </div>
        ) : null}

        <div
          ref={contentRef}
          role="textbox"
          aria-multiline="true"
          contentEditable={editing}
          suppressContentEditableWarning
          onClick={startEditing}
          onFocus={startEditing}
          onBlur={stopEditing}
          onInput={handleInput}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          className={cn(
            "min-h-6 rounded px-1 py-0.5 text-sm leading-6 outline-none empty:before:text-muted-foreground/60 empty:before:content-['클릭해서_입력...']",
            isLockedByOther && "cursor-not-allowed bg-muted/60",
            editing && "ring-2 ring-offset-1"
          )}
          style={editing ? ({ ["--tw-ring-color" as string]: me.color } as React.CSSProperties) : undefined}
        />
        {isLockedByOther && lockedByParticipant ? (
          <p className="mt-0.5 text-[11px]" style={{ color: lockedByParticipant.color }}>
            {lockedByParticipant.abbr || displayName(lockedByParticipant.name) || lockedByParticipant.email}
            님이 편집 중
          </p>
        ) : null}
      </div>
    </div>
  )
}

function displayName(name: string | null) {
  if (!name) return null
  return name.length > 4 ? name.slice(0, 4) : name
}
