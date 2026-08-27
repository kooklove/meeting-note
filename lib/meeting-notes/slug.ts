function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function suggestSlug(title: string, now: Date = new Date()) {
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`
  const trimmed = title.trim()
  const safeTitle = (trimmed.length > 0 ? trimmed : "Title").replace(/\s+/g, "_")
  return `${stamp}_${safeTitle}`
}

const SLUG_PATTERN = /^[^\s/]{1,120}$/

export function isValidSlug(slug: string) {
  return SLUG_PATTERN.test(slug)
}
