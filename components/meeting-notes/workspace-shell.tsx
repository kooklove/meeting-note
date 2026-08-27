"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WorkspaceSidebar } from "./workspace-sidebar"

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNoteView = pathname?.startsWith("/notes/") ?? false

  if (!isNoteView) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    )
  }

  // pathname을 key로 주면 회의록이 바뀔 때마다 오버레이 열림 상태가 새로 초기화된다.
  return (
    <NoteViewShell key={pathname}>{children}</NoteViewShell>
  )
}

function NoteViewShell({ children }: { children: React.ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute left-3 top-3 z-20 shadow-sm"
        onClick={() => setOverlayOpen((v) => !v)}
        aria-label="회의록 목록 펼치기"
      >
        <PanelLeft className="size-4" />
      </Button>

      {overlayOpen ? (
        <div className="absolute inset-0 z-10 flex">
          <div className="h-full shadow-xl">
            <WorkspaceSidebar />
          </div>
          <button
            type="button"
            aria-label="목록 닫기"
            className="flex-1 cursor-default bg-black/20"
            onClick={() => setOverlayOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
