import { WorkspaceSidebar } from "@/components/meeting-notes/workspace-sidebar"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <WorkspaceSidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
