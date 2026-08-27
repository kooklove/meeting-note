import { NoteApp } from "@/components/meeting-notes/note-app"

export default async function MeetingNotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <NoteApp slug={decodeURIComponent(slug)} />
}
