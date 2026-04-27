import { DAYS, TIME_SLOTS } from '../data/seedTrip'

export const TIMELINE_HOURS_PER_SLOT = 24 / Math.max(TIME_SLOTS.length || 1, 1)
export const PLAYBACK_SLOT_UNITS_PER_SECOND = 0.1
export const PLAYBACK_MAX_FRAME_DELTA_SECONDS = 0.18
export const PLAYBACK_STALL_RESET_SECONDS = 0.6
export const MISSION_LAUNCH_HOUR = 9

export function clampTimelineCursor(slot) {
  const maxCursor = DAYS.length * TIME_SLOTS.length - 0.001
  return Math.min(Math.max(slot, 0), maxCursor)
}

export function getCursorDay(cursorSlot) {
  const dayIndex = Math.min(
    Math.floor(cursorSlot / TIME_SLOTS.length),
    DAYS.length - 1
  )
  return DAYS[Math.max(dayIndex, 0)] || DAYS[0]
}

export function getCursorDayIndex(cursorSlot) {
  return Math.min(
    Math.floor(cursorSlot / TIME_SLOTS.length),
    DAYS.length - 1
  )
}

export function getSlotHour(cursorSlot) {
  const normalized = clampTimelineCursor(cursorSlot)
  const dayOffset = normalized - Math.floor(normalized / TIME_SLOTS.length) * TIME_SLOTS.length
  return dayOffset * TIMELINE_HOURS_PER_SLOT
}

export function getSlotLabel(cursorSlot) {
  const day = getCursorDay(cursorSlot)
  const hour = getSlotHour(cursorSlot)
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  return `${day.shortLabel} ${time}`
}

export function buildOperationCheckpoints(items) {
  return DAYS.map((day, dayIndex) => {
    const mainOp = (items || [])
      .filter((item) => item.day_id === day.id && item.row_id === 'activities')
      .sort((a, b) => a.start_slot - b.start_slot)[0]

    if (!mainOp) return null

    return {
      id: `op:${day.id}:${mainOp.id}`,
      dayId: day.id,
      startSlot: mainOp.start_slot + dayIndex * TIME_SLOTS.length,
      title: mainOp.title,
      subtitle: 'Primary operation',
      dayLabel: day.title,
      items: [mainOp],
      type: 'main-op',
      autoAdvanceMs: 4200,
    }
  }).filter(Boolean)
}

export function findCrossedCheckpoint(checkpoints, previousCursor, nextCursor, triggeredIds) {
  return (
    checkpoints.find(
      (cp) =>
        !triggeredIds.has(cp.id) &&
        previousCursor <= cp.startSlot &&
        nextCursor >= cp.startSlot
    ) || null
  )
}

export function getSuggestedPlaybackStart(cursorSlot, checkpoints) {
  const normalized = clampTimelineCursor(cursorSlot)
  if (!checkpoints.length) return normalized

  const active = checkpoints.find(
    (cp) => normalized >= cp.startSlot && normalized <= cp.startSlot + 0.5
  )
  if (active) return normalized

  const next = checkpoints.find((cp) => cp.startSlot > normalized)
  if (next) return clampTimelineCursor(Math.max(next.startSlot - 0.08, 0))

  return normalized
}

export function getMissionLaunchTheme(dayId) {
  const themes = {
    thu: {
      accent: '#F2CC60',
      accentStrong: '#FFD76B',
      accentSoft: 'rgba(242, 204, 96, 0.14)',
      accentGlow: 'rgba(242, 204, 96, 0.28)',
      accentBorder: 'rgba(242, 204, 96, 0.34)',
      accentText: '#F2CC60',
      panelGlow: 'rgba(242, 204, 96, 0.18)',
    },
    fri: {
      accent: '#58A6FF',
      accentStrong: '#7AB8FF',
      accentSoft: 'rgba(88, 166, 255, 0.14)',
      accentGlow: 'rgba(88, 166, 255, 0.26)',
      accentBorder: 'rgba(88, 166, 255, 0.34)',
      accentText: '#58A6FF',
      panelGlow: 'rgba(88, 166, 255, 0.18)',
    },
    sat: {
      accent: '#F85149',
      accentStrong: '#FF7B72',
      accentSoft: 'rgba(248, 81, 73, 0.14)',
      accentGlow: 'rgba(248, 81, 73, 0.26)',
      accentBorder: 'rgba(248, 81, 73, 0.34)',
      accentText: '#F85149',
      panelGlow: 'rgba(248, 81, 73, 0.18)',
    },
    sun: {
      accent: '#3FB950',
      accentStrong: '#56D364',
      accentSoft: 'rgba(63, 185, 80, 0.14)',
      accentGlow: 'rgba(63, 185, 80, 0.26)',
      accentBorder: 'rgba(63, 185, 80, 0.34)',
      accentText: '#3FB950',
      panelGlow: 'rgba(63, 185, 80, 0.18)',
    },
  }
  return themes[dayId] || themes.thu
}
