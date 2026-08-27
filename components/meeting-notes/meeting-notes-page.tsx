"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

import { CreateMeetingNoteDialog } from "./create-meeting-note-dialog"
import { MeetingNoteCard } from "./meeting-note-card"
import { initialMeetingNotes } from "./mock-data"
import type { MeetingNote } from "./types"

function matchesQuery(note: MeetingNote, keyword: string) {
  return [note.title, note.summary, ...note.participants]
    .join(" ")
    .toLowerCase()
    .includes(keyword)
}

export function MeetingNotesPage() {
  const [notes, setNotes] = useState<MeetingNote[]>(initialMeetingNotes)
  const [query, setQuery] = useState("")

  const filteredNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return notes
    return notes.filter((note) => matchesQuery(note, keyword))
  }, [notes, query])

  function handleCreate(note: MeetingNote) {
    setNotes((prev) => [note, ...prev])
  }

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            회의록
          </h1>
          <p className="text-muted-foreground">
            팀 회의 내용을 기록하고 한눈에 모아보세요.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 참석자로 검색"
            />
          </InputGroup>
          <CreateMeetingNoteDialog onCreate={handleCreate} />
        </div>

        {filteredNotes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredNotes.map((note) => (
              <MeetingNoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyDescription>
                다른 검색어로 다시 시도하거나 새 회의록을 작성해보세요.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>
    </div>
  )
}
