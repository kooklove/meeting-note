import type { InlineStyle, Run } from "@/lib/meeting-notes/types"

export const FONT_FAMILIES = [
  { label: "기본", value: "" },
  { label: "명조", value: "Georgia, serif" },
  { label: "고딕", value: "Pretendard, system-ui, sans-serif" },
  { label: "모노스페이스", value: "'Geist Mono', monospace" },
]

export const FONT_SIZES = [12, 14, 16, 18, 21, 24, 32]

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function styleToCss(style: InlineStyle) {
  const parts: string[] = []
  if (style.bold) parts.push("font-weight:700")
  if (style.italic) parts.push("font-style:italic")
  if (style.underline) parts.push("text-decoration:underline")
  if (style.fontFamily) parts.push(`font-family:${style.fontFamily}`)
  if (style.fontSize) parts.push(`font-size:${style.fontSize}px`)
  return parts.join(";")
}

export function runsToHtml(runs: Run[]): string {
  if (runs.length === 0) return ""
  return runs
    .map((run) => {
      const css = styleToCss(run.style)
      const text = escapeHtml(run.text)
      return css ? `<span style="${css}">${text}</span>` : text
    })
    .join("")
}

function styleFromElement(el: HTMLElement, inherited: InlineStyle): InlineStyle {
  const style: InlineStyle = { ...inherited }
  const tag = el.tagName.toLowerCase()
  if (tag === "b" || tag === "strong") style.bold = true
  if (tag === "i" || tag === "em") style.italic = true
  if (tag === "u") style.underline = true

  if (el.style.fontWeight === "bold" || Number(el.style.fontWeight) >= 600) style.bold = true
  if (el.style.fontStyle === "italic") style.italic = true
  if (el.style.textDecorationLine.includes("underline") || el.style.textDecoration.includes("underline")) {
    style.underline = true
  }
  if (el.style.fontFamily) style.fontFamily = el.style.fontFamily.replace(/["']/g, "")
  if (el.style.fontSize) {
    const px = Number.parseInt(el.style.fontSize, 10)
    if (!Number.isNaN(px)) style.fontSize = px
  }
  return style
}

function sameStyle(a: InlineStyle, b: InlineStyle) {
  return (
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    a.fontFamily === b.fontFamily &&
    a.fontSize === b.fontSize
  )
}

function walk(node: Node, inherited: InlineStyle, runs: Run[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ""
    if (text.length > 0) runs.push({ text, style: { ...inherited } })
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as HTMLElement
  if (el.tagName.toLowerCase() === "br") {
    runs.push({ text: "\n", style: { ...inherited } })
    return
  }
  const style = styleFromElement(el, inherited)
  for (const child of Array.from(el.childNodes)) walk(child, style, runs)
}

export function htmlToRuns(container: HTMLElement): Run[] {
  const rawRuns: Run[] = []
  for (const child of Array.from(container.childNodes)) walk(child, {}, rawRuns)

  const merged: Run[] = []
  for (const run of rawRuns) {
    const last = merged[merged.length - 1]
    if (last && sameStyle(last.style, run.style)) {
      last.text += run.text
    } else {
      merged.push({ text: run.text, style: { ...run.style } })
    }
  }
  return merged
}

function styleOfTopLevelNode(node: Node): InlineStyle {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return styleFromElement(node as HTMLElement, {})
  }
  return {}
}

export function applySelectionStyle(
  container: HTMLElement,
  mutate: (current: InlineStyle) => InlineStyle
) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  if (range.collapsed) return
  if (!container.contains(range.commonAncestorContainer)) return

  const fragment = range.extractContents()
  const wrapper = document.createDocumentFragment()

  const children = Array.from(fragment.childNodes)
  for (const node of children) {
    const current = styleOfTopLevelNode(node)
    const next = mutate(current)
    const span = document.createElement("span")
    const css = styleToCss(next)
    if (css) span.setAttribute("style", css)
    span.textContent = node.textContent ?? ""
    wrapper.appendChild(span)
  }

  const insertedNodes = Array.from(wrapper.childNodes)
  range.insertNode(wrapper)

  if (insertedNodes.length > 0) {
    const newRange = document.createRange()
    newRange.setStartBefore(insertedNodes[0])
    newRange.setEndAfter(insertedNodes[insertedNodes.length - 1])
    selection.removeAllRanges()
    selection.addRange(newRange)
  }
}

export function isSelectionActive(command: "bold" | "italic" | "underline") {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}
