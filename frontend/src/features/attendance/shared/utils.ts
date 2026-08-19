export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatTodayLong() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTodayShort() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export function formatDateDisplay(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Slot labels are "8-9am" / "2-3pm" style — pull out the 24-hour start hour.
export function parseSlotStartHour(slotLabel?: string): number | null {
  if (!slotLabel) return null
  const match = slotLabel.match(/^(\d{1,2})-\d{1,2}(am|pm)$/i)
  if (!match) return null
  let hour = parseInt(match[1], 10)
  const period = match[2].toLowerCase()
  if (period === 'pm' && hour !== 12) hour += 12
  if (period === 'am' && hour === 12) hour = 0
  return hour
}

export const AUTO_ABSENT_WINDOW_MINUTES = 60

// A scheduled student who hasn't checked in within 60 minutes of their slot
// start is due to be auto-marked Absent.
export function isAutoAbsentDue(
  record: { hasSlot: boolean; slotLabel?: string; checkInTime?: string; status?: string },
  now: Date = new Date(),
): boolean {
  if (!record.hasSlot || record.status || record.checkInTime) return false
  const startHour = parseSlotStartHour(record.slotLabel)
  if (startHour === null) return false
  const slotStart = new Date(now)
  slotStart.setHours(startHour, 0, 0, 0)
  const deadline = new Date(slotStart.getTime() + AUTO_ABSENT_WINDOW_MINUTES * 60_000)
  return now >= deadline
}

