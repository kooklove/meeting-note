import { Badge } from "@/components/ui/badge"
import type { MeetingStatus } from "@/lib/meeting-notes/types"

const LABELS: Record<MeetingStatus, string> = {
  draft: "작성 중",
  confirming: "확인 대기",
  sent: "발송됨",
}

const VARIANTS: Record<MeetingStatus, "outline" | "secondary" | "default"> = {
  draft: "outline",
  confirming: "secondary",
  sent: "default",
}

export function NoteStatusBadge({ status }: { status: MeetingStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
}
