import type { Participant } from "./types"

export function participantLabel(participant: Participant): string {
  return participant.abbr || participant.name || participant.email
}
