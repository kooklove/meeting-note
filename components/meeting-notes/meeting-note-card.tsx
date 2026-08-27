import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { MeetingNote } from "./types"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function MeetingNoteCard({ note }: { note: MeetingNote }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <CardDescription>{formatDate(note.date)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{note.summary}</p>
        {note.participants.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <AvatarGroup>
              {note.participants.map((participant) => (
                <Avatar key={participant} size="sm">
                  <AvatarFallback>{participant.slice(0, 1)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <Badge variant="secondary">{note.participants.length}명 참석</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
