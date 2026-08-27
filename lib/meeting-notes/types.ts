export type InlineStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  highlight?: boolean
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

export type MeetingStatus = "draft" | "confirming" | "sent"

export type MeetingNote = {
  slug: string
  title: string
  scheduledAt: number
  agenda: string | null
  inviteEmails: string[]
  createdAt: number
  hostId: string | null
  participants: Record<string, Participant>
  lines: Line[]
  meetingEnded: boolean
  confirmedBy: Set<string>
  sentAt: number | null
  onlineMeetingUrl: string | null
}

export type MeetingNoteSnapshot = Omit<
  MeetingNote,
  "participants" | "confirmedBy"
> & {
  participants: Participant[]
  usedColors: string[]
  status: MeetingStatus
  confirmedParticipantIds: string[]
}

export type MeetingNoteSummary = {
  slug: string
  title: string
  scheduledAt: number
  agenda: string | null
  inviteEmails: string[]
  createdAt: number
  status: MeetingStatus
  participantCount: number
}

export type CursorPosition = {
  participantId: string
  x: number
  y: number
  at: number
}

export type NoteEvent =
  | { type: "participant-joined"; participant: Participant }
  | { type: "line-created"; line: Line; index: number }
  | { type: "line-updated"; line: Line }
  | { type: "line-locked"; lineId: string; lock: LineLock }
  | { type: "line-unlocked"; lineId: string }
  | { type: "confirmations-changed"; meetingEnded: boolean; confirmedParticipantIds: string[] }
  | { type: "status-changed"; status: MeetingStatus; sentAt: number | null }
  | { type: "cursor-moved"; participantId: string; x: number; y: number; at: number }
  | { type: "online-meeting-url-changed"; onlineMeetingUrl: string | null }

export type GlobalNoteEvent =
  | { type: "note-created"; note: MeetingNoteSummary }
  | { type: "note-status-changed"; slug: string; status: MeetingStatus }
