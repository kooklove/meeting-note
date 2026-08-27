export type InlineStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  fontFamily?: string
  fontSize?: number
}

export type Run = {
  text: string
  style: InlineStyle
}

export type LineKind = "paragraph" | "bullet"

export type LineLock = {
  participantId: string
  lockedAt: number
}

export type Line = {
  id: string
  kind: LineKind
  indent: number
  runs: Run[]
  authorIds: string[]
  lock: LineLock | null
}

export type Participant = {
  id: string
  email: string
  name: string | null
  org: string | null
  abbr: string | null
  color: string
  isHost: boolean
  joinedAt: number
}

export type MeetingNote = {
  slug: string
  title: string
  createdAt: number
  hostId: string | null
  participants: Record<string, Participant>
  lines: Line[]
}

export type MeetingNoteSnapshot = Omit<MeetingNote, "participants"> & {
  participants: Participant[]
  usedColors: string[]
}

export type NoteEvent =
  | { type: "participant-joined"; participant: Participant }
  | { type: "line-created"; line: Line; index: number }
  | { type: "line-updated"; line: Line }
  | { type: "line-locked"; lineId: string; lock: LineLock }
  | { type: "line-unlocked"; lineId: string }
