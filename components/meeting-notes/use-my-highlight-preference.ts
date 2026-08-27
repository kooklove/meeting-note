"use client"

import { useState } from "react"

const STORAGE_KEY = "meeting-note:my-highlight-enabled"

export function useMyHighlightPreference() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  })

  function toggle() {
    setEnabled((prev) => {
      const next = !prev
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      return next
    })
  }

  return { enabled, toggle }
}
