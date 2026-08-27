"use client"

import { useEffect, useRef } from "react"

const THROTTLE_MS = 150

export function useCursorBroadcast(
  slug: string,
  participantId: string,
  containerRef: React.RefObject<HTMLElement | null>
) {
  const lastSentAtRef = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastSentAtRef.current < THROTTLE_MS) return
      lastSentAtRef.current = now

      const rect = el!.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      if (x < 0 || x > 100 || y < 0 || y > 100) return

      fetch(`/api/meeting-notes/${encodeURIComponent(slug)}/cursor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, x, y }),
        keepalive: true,
      }).catch(() => {})
    }

    el.addEventListener("mousemove", handleMove)
    return () => el.removeEventListener("mousemove", handleMove)
  }, [slug, participantId, containerRef])
}
