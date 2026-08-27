"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { CreateNoteDialog } from "./create-note-dialog"
import { NoteListItem } from "./note-list-item"
import { useNotesListStream } from "./use-notes-list-stream"
import type { MeetingNoteSummary } from "@/lib/meeting-notes/types"

function matchesQuery(note: MeetingNoteSummary, keyword: string) {
  return [note.title, note.agenda ?? "", ...note.inviteEmails]
    .join(" ")
    .toLowerCase()
    .includes(keyword)
}

export function WorkspaceSidebar() {
  const notes = useNotesListStream()
  const [query, setQuery] = useState("")
  const pathname = usePathname()

  const filtered = useMemo(() => {
    if (!notes) return null
    const keyword = query.trim().toLowerCase()
    if (!keyword) return notes
    return notes.filter((note) => matchesQuery(note, keyword))
  }, [notes, query])

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 border-r bg-muted/30 p-4">
      <div>
        <h1 className="text-lg font-semibold">회의록</h1>
        <p className="text-xs text-muted-foreground">팀 회의를 함께 기록하고 정리합니다.</p>
      </div>

      <CreateNoteDialog />

      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목, 논의할 내용, 초대 대상 email로 검색"
        />
      </InputGroup>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {filtered === null ? (
          <p className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query ? "검색 결과가 없습니다." : "아직 만든 회의록이 없습니다."}
          </p>
        ) : (
          filtered.map((note) => (
            <NoteListItem
              key={note.slug}
              note={note}
              active={pathname === `/notes/${encodeURIComponent(note.slug)}`}
            />
          ))
        )}
      </div>
    </aside>
  )
}
