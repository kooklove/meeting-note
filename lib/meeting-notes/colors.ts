export const HOST_DEFAULT_COLOR = "#e11d48"

export const PARTICIPANT_COLORS: string[] = [
  "#e11d48",
  "#ea580c",
  "#d97706",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#059669",
  "#0d9488",
  "#0891b2",
  "#0284c7",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#9333ea",
  "#c026d3",
  "#db2777",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
]

export function pickDefaultColor(usedColors: string[], isHost: boolean): string | null {
  if (isHost && !usedColors.includes(HOST_DEFAULT_COLOR)) {
    return HOST_DEFAULT_COLOR
  }
  return PARTICIPANT_COLORS.find((color) => !usedColors.includes(color)) ?? null
}
