import { pickDefaultColor, PARTICIPANT_COLORS } from "./colors"
import { participantLabel } from "./participant-label"
import type {
  GlobalNoteEvent,
  Line,
  MeetingNote,
  MeetingNoteSnapshot,
  MeetingNoteSummary,
  MeetingStatus,
  NoteEvent,
  Participant,
} from "./types"

const LOCK_STALE_MS = 30_000

type Subscriber = (event: NoteEvent) => void
type GlobalSubscriber = (event: GlobalNoteEvent) => void

type StoreState = {
  notes: Map<string, MeetingNote>
  subscribers: Map<string, Set<Subscriber>>
  globalSubscribers: Set<GlobalSubscriber>
}

const globalForStore = globalThis as unknown as { __meetingNoteStore?: StoreState }

const state: StoreState =
  globalForStore.__meetingNoteStore ??
  (globalForStore.__meetingNoteStore = {
    notes: new Map(),
    subscribers: new Map(),
    globalSubscribers: new Set(),
  })

function newId() {
  return crypto.randomUUID()
}

function publish(slug: string, event: NoteEvent) {
  const listeners = state.subscribers.get(slug)
  if (!listeners) return
  for (const listener of listeners) listener(event)
}

function publishGlobal(event: GlobalNoteEvent) {
  for (const listener of state.globalSubscribers) listener(event)
}

function releaseIfStale(line: Line) {
  if (line.lock && Date.now() - line.lock.lockedAt > LOCK_STALE_MS) {
    line.lock = null
  }
}

function deriveStatus(note: MeetingNote): MeetingStatus {
  if (note.sentAt) return "sent"
  if (note.meetingEnded) return "confirming"
  return "draft"
}

function clearConfirmations(note: MeetingNote) {
  if (note.confirmedBy.size === 0) return
  note.confirmedBy.clear()
  publish(note.slug, {
    type: "confirmations-changed",
    meetingEnded: note.meetingEnded,
    confirmedParticipantIds: [],
  })
}

export function toSnapshot(note: MeetingNote): MeetingNoteSnapshot {
  const participants = Object.values(note.participants).sort((a, b) => a.joinedAt - b.joinedAt)
  for (const line of note.lines) releaseIfStale(line)
  return {
    slug: note.slug,
    title: note.title,
    scheduledAt: note.scheduledAt,
    agenda: note.agenda,
    inviteEmails: note.inviteEmails,
    createdAt: note.createdAt,
    hostId: note.hostId,
    lines: note.lines,
    participants,
    usedColors: participants.map((p) => p.color),
    meetingEnded: note.meetingEnded,
    confirmedParticipantIds: [...note.confirmedBy],
    status: deriveStatus(note),
    sentAt: note.sentAt,
  }
}

export function toSummary(note: MeetingNote): MeetingNoteSummary {
  return {
    slug: note.slug,
    title: note.title,
    scheduledAt: note.scheduledAt,
    agenda: note.agenda,
    inviteEmails: note.inviteEmails,
    createdAt: note.createdAt,
    status: deriveStatus(note),
    participantCount: Object.keys(note.participants).length,
  }
}

export type CreateNoteInput = {
  title: string
  slug: string
  scheduledAt: number
  agenda?: string | null
  inviteEmails?: string[]
}

export function createNote(input: CreateNoteInput): MeetingNoteSnapshot {
  if (state.notes.has(input.slug)) {
    throw new Error("SLUG_TAKEN")
  }
  const note: MeetingNote = {
    slug: input.slug,
    title: input.title,
    scheduledAt: input.scheduledAt,
    agenda: input.agenda?.trim() || null,
    inviteEmails: input.inviteEmails ?? [],
    createdAt: Date.now(),
    hostId: null,
    participants: {},
    lines: [
      {
        id: newId(),
        kind: "paragraph",
        indent: 0,
        runs: [],
        authorIds: [],
        lock: null,
      },
    ],
    meetingEnded: false,
    confirmedBy: new Set(),
    sentAt: null,
  }
  state.notes.set(input.slug, note)
  publishGlobal({ type: "note-created", note: toSummary(note) })
  return toSnapshot(note)
}

export function getNote(slug: string): MeetingNote | null {
  return state.notes.get(slug) ?? null
}

export function getSnapshot(slug: string): MeetingNoteSnapshot | null {
  const note = getNote(slug)
  return note ? toSnapshot(note) : null
}

export function listNotes(): MeetingNoteSummary[] {
  return [...state.notes.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(toSummary)
}

export type JoinInput = {
  email: string
  name?: string | null
  org?: string | null
  abbr?: string | null
  color?: string | null
}

export function joinParticipant(
  slug: string,
  input: JoinInput
): { participant: Participant } | { error: "NOTE_NOT_FOUND" | "COLOR_TAKEN" } {
  const note = getNote(slug)
  if (!note) return { error: "NOTE_NOT_FOUND" }

  const usedColors = Object.values(note.participants).map((p) => p.color)
  const isHost = note.hostId === null

  let color = input.color?.trim() || null
  if (color) {
    if (!PARTICIPANT_COLORS.includes(color) || usedColors.includes(color)) {
      return { error: "COLOR_TAKEN" }
    }
  } else {
    color = pickDefaultColor(usedColors, isHost) ?? PARTICIPANT_COLORS[0]
  }

  const participant: Participant = {
    id: newId(),
    email: input.email,
    name: input.name?.trim() || null,
    org: input.org?.trim() || null,
    abbr: input.abbr?.trim().slice(0, 3) || null,
    color,
    isHost,
    joinedAt: Date.now(),
  }

  note.participants[participant.id] = participant
  if (isHost) note.hostId = participant.id

  publish(slug, { type: "participant-joined", participant })
  return { participant }
}

export function getParticipant(slug: string, sessionId: string): Participant | null {
  const note = getNote(slug)
  if (!note) return null
  return note.participants[sessionId] ?? null
}

export type CreateLineInput = {
  afterLineId?: string | null
  kind?: "paragraph" | "bullet"
  indent?: number
  participantId: string
}

export function createLine(
  slug: string,
  input: CreateLineInput
): { line: Line; index: number } | { error: "NOTE_NOT_FOUND" } {
  const note = getNote(slug)
  if (!note) return { error: "NOTE_NOT_FOUND" }

  const line: Line = {
    id: newId(),
    kind: input.kind ?? "paragraph",
    indent: Math.max(0, Math.min(3, input.indent ?? 0)),
    runs: [],
    authorIds: [],
    lock: { participantId: input.participantId, lockedAt: Date.now() },
  }

  let index = note.lines.length
  if (input.afterLineId) {
    const afterIndex = note.lines.findIndex((l) => l.id === input.afterLineId)
    if (afterIndex !== -1) index = afterIndex + 1
  }
  note.lines.splice(index, 0, line)
  clearConfirmations(note)

  publish(slug, { type: "line-created", line, index })
  return { line, index }
}

export function lockLine(
  slug: string,
  lineId: string,
  participantId: string
): { ok: true } | { ok: false; lockedBy: string } {
  const note = getNote(slug)
  if (!note) return { ok: false, lockedBy: "" }
  const line = note.lines.find((l) => l.id === lineId)
  if (!line) return { ok: false, lockedBy: "" }

  releaseIfStale(line)

  if (line.lock && line.lock.participantId !== participantId) {
    return { ok: false, lockedBy: line.lock.participantId }
  }

  line.lock = { participantId, lockedAt: Date.now() }
  publish(slug, { type: "line-locked", lineId, lock: line.lock })
  return { ok: true }
}

export function unlockLine(
  slug: string,
  lineId: string,
  participantId: string
): { ok: boolean } {
  const note = getNote(slug)
  if (!note) return { ok: false }
  const line = note.lines.find((l) => l.id === lineId)
  if (!line) return { ok: false }

  if (line.lock && line.lock.participantId !== participantId) {
    return { ok: false }
  }

  line.lock = null
  publish(slug, { type: "line-unlocked", lineId })
  return { ok: true }
}

export type UpdateLineInput = {
  participantId: string
  runs: Line["runs"]
  kind?: "paragraph" | "bullet"
  indent?: number
}

export function updateLine(
  slug: string,
  lineId: string,
  input: UpdateLineInput
): { line: Line } | { error: "NOT_FOUND" | "NOT_LOCKED_BY_YOU" } {
  const note = getNote(slug)
  if (!note) return { error: "NOT_FOUND" }
  const line = note.lines.find((l) => l.id === lineId)
  if (!line) return { error: "NOT_FOUND" }

  releaseIfStale(line)
  if (!line.lock || line.lock.participantId !== input.participantId) {
    return { error: "NOT_LOCKED_BY_YOU" }
  }

  line.runs = input.runs
  if (input.kind) line.kind = input.kind
  if (typeof input.indent === "number") line.indent = Math.max(0, Math.min(3, input.indent))
  line.lock = { participantId: input.participantId, lockedAt: Date.now() }

  line.authorIds = [
    input.participantId,
    ...line.authorIds.filter((id) => id !== input.participantId),
  ].slice(0, 3)

  clearConfirmations(note)
  publish(slug, { type: "line-updated", line })
  return { line }
}

export function setMeetingEnded(
  slug: string,
  ended: boolean
): { meetingEnded: boolean } | { error: "NOT_FOUND" } {
  const note = getNote(slug)
  if (!note) return { error: "NOT_FOUND" }

  note.meetingEnded = ended
  note.confirmedBy.clear()

  publish(slug, {
    type: "confirmations-changed",
    meetingEnded: note.meetingEnded,
    confirmedParticipantIds: [],
  })
  publish(slug, { type: "status-changed", status: deriveStatus(note), sentAt: note.sentAt })
  return { meetingEnded: note.meetingEnded }
}

export function setConfirmation(
  slug: string,
  participantId: string,
  confirmed: boolean
): { confirmedParticipantIds: string[] } | { error: "NOT_FOUND" | "NOT_ENDED" } {
  const note = getNote(slug)
  if (!note) return { error: "NOT_FOUND" }
  if (!note.meetingEnded) return { error: "NOT_ENDED" }

  if (confirmed) note.confirmedBy.add(participantId)
  else note.confirmedBy.delete(participantId)

  const confirmedParticipantIds = [...note.confirmedBy]
  publish(slug, {
    type: "confirmations-changed",
    meetingEnded: note.meetingEnded,
    confirmedParticipantIds,
  })
  return { confirmedParticipantIds }
}

function lineToPlainText(line: Line): string {
  const text = line.runs.map((run) => run.text).join("")
  const indent = "  ".repeat(line.indent)
  if (line.kind === "bullet") return `${indent}- ${text}`
  return `${indent}${text}`
}

export type SendMethod = "clipboard" | "teams" | "mail"

export function sendNote(
  slug: string
): { text: string; status: MeetingStatus; sentAt: number } | { error: "NOT_FOUND" } {
  const note = getNote(slug)
  if (!note) return { error: "NOT_FOUND" }

  const body = note.lines.map(lineToPlainText).join("\n")
  const participants = Object.values(note.participants).sort((a, b) => a.joinedAt - b.joinedAt)
  const confirmed = participants.filter((p) => note.confirmedBy.has(p.id))
  const unconfirmed = participants.filter((p) => !note.confirmedBy.has(p.id))

  const footer = [
    "",
    "---",
    `최종내용 확인 참석자: ${confirmed.length > 0 ? confirmed.map(participantLabel).join(", ") : "없음"}`,
    `최종내용 미확인 참석자: ${unconfirmed.length > 0 ? unconfirmed.map(participantLabel).join(", ") : "없음"}`,
  ].join("\n")

  const wasSent = note.sentAt !== null
  if (!note.sentAt) note.sentAt = Date.now()
  const status = deriveStatus(note)

  if (!wasSent) {
    publish(slug, { type: "status-changed", status, sentAt: note.sentAt })
    publishGlobal({ type: "note-status-changed", slug, status })
  }

  return { text: `${body}${footer}`, status, sentAt: note.sentAt }
}

export function moveCursor(slug: string, participantId: string, x: number, y: number) {
  const note = getNote(slug)
  if (!note) return
  publish(slug, { type: "cursor-moved", participantId, x, y, at: Date.now() })
}

export function subscribe(slug: string, listener: Subscriber): () => void {
  let listeners = state.subscribers.get(slug)
  if (!listeners) {
    listeners = new Set()
    state.subscribers.set(slug, listeners)
  }
  listeners.add(listener)
  return () => {
    listeners?.delete(listener)
  }
}

export function subscribeGlobal(listener: GlobalSubscriber): () => void {
  state.globalSubscribers.add(listener)
  return () => {
    state.globalSubscribers.delete(listener)
  }
}
