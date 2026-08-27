import { CreateNoteForm } from "@/components/meeting-notes/create-note-form"

export default function NewMeetingNotePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20">
      <h1 className="text-2xl font-semibold">새 회의록 만들기</h1>
      <CreateNoteForm />
    </div>
  )
}
