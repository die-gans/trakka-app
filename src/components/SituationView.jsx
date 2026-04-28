import { memo, useMemo } from 'react'
import { Play, Pause, RotateCcw, Gauge, Sun, Cloud, CloudRain, CloudSun, MapPin, Clock, Route, Utensils, ClipboardList } from 'lucide-react'
import { MapView } from './MapView'
import { PlaybackBar } from './PlaybackBar'
import { DAYS, TIME_SLOTS } from '../data/seedTrip'
import { getSlotLabel, getCursorDay, getCursorDayIndex, getSlotHour } from '../lib/timeline-helpers'
import { cn } from '../lib/utils'

const WEATHER_ICONS = {
  Sunny: Sun,
  'Partly Cloudy': CloudSun,
  Showers: CloudRain,
}

const COLORS = {
  info: '#58A6FF',
  warning: '#D29922',
  success: '#3FB950',
  critical: '#F85149',
  violet: '#A371F7',
}

const LANE_ICONS = {
  travel: Route,
  activities: MapPin,
  support: Utensils,
}

const LANE_LABELS = {
  travel: 'Travel',
  activities: 'Activities',
  support: 'Support',
}

function MiniLegend() {
  return (
    <div className="flex flex-col gap-1.5 text-[9px] font-bold text-text-secondary">
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full" style={{ background: COLORS.info, border: '1px solid rgba(10,12,16,0.8)' }} />
        Basecamp
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full" style={{ background: COLORS.success, border: '1px solid rgba(10,12,16,0.8)' }} />
        Origin
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.critical, border: '1px solid white', boxShadow: `0 0 6px ${COLORS.critical}` }} />
        Convoy
      </div>
    </div>
  )
}

function FloatingPlaybackControls({ cursorSlot, isPlaying, playbackSpeed, onTogglePlayback, onRestartPlayback, onSetPlaybackSpeed }) {
  const currentLabel = getSlotLabel(cursorSlot)

  return (
    <div className={cn(
      "pointer-events-auto flex items-center gap-2 border px-3 py-2 shadow-lg transition-colors",
      isPlaying ? 'border-info/60 bg-info-soft/90' : 'border-border-default bg-bg-panel/90'
    )}>
      <button
        type="button"
        onClick={onTogglePlayback}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center border transition-colors",
          isPlaying
            ? 'border-info bg-info text-white hover:bg-info/80'
            : 'border-info/40 bg-info-soft text-info hover:border-info'
        )}
        title={isPlaying ? 'Pause playback' : 'Play playback'}
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} className="translate-x-[1px]" />}
      </button>
      <button
        type="button"
        onClick={onRestartPlayback}
        className="inline-flex h-7 w-7 items-center justify-center border border-border-default bg-bg-panel text-text-secondary transition-colors hover:border-info/40 hover:text-text-primary"
        title="Restart playback"
      >
        <RotateCcw size={13} />
      </button>
      <button
        type="button"
        onClick={() => onSetPlaybackSpeed?.((playbackSpeed % 4) + 1)}
        className="inline-flex h-7 items-center justify-center gap-1 border border-border-default bg-bg-panel px-2 text-text-secondary transition-colors hover:border-info/40 hover:text-text-primary"
        title="Change playback speed"
      >
        <Gauge size={10} />
        <span className="text-[9px] font-black uppercase tracking-[0.16em]">{playbackSpeed}x</span>
      </button>
      <div className="ml-1 border-l border-border-default pl-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-info">{currentLabel}</div>
      </div>
    </div>
  )
}

function DayBadge({ cursorSlot }) {
  const day = getCursorDay(cursorSlot)
  const Icon = WEATHER_ICONS[day.weather] || Sun

  return (
    <div className="pointer-events-auto flex items-center gap-2 border border-border-default bg-bg-panel/90 px-3 py-2 shadow-lg">
      <Icon size={14} className="text-warning" />
      <div>
        <div className="text-[10px] font-black uppercase tracking-wider text-text-primary">{day.shortLabel}</div>
        <div className="text-[9px] font-bold text-text-secondary">{day.weather} · {day.temperature}</div>
      </div>
    </div>
  )
}

function EventFeed({ items, cursorSlot, isPlaying }) {
  const dayIndex = getCursorDayIndex(cursorSlot)
  const hour = getSlotHour(cursorSlot)

  const dayItems = useMemo(() => {
    const dayId = DAYS[dayIndex]?.id
    if (!dayId) return []
    return (items || [])
      .filter((item) => item.day_id === dayId)
      .sort((a, b) => (a.start_slot || 0) - (b.start_slot || 0))
  }, [items, dayIndex])

  if (dayItems.length === 0) {
    return (
      <div className="flex h-10 items-center border-t border-border-default bg-bg-panel px-4">
        <div className="text-[10px] font-bold text-text-muted">No scheduled items for this day</div>
      </div>
    )
  }

  return (
    <div className="border-t border-border-default bg-bg-panel">
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border-default/50">
        <Clock size={10} className="text-text-secondary" />
        <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
          {DAYS[dayIndex]?.shortLabel} Timeline
        </span>
        <span className="text-[9px] font-bold text-text-muted">
          {String(Math.floor(hour)).padStart(2, '0')}:{String(Math.round((hour % 1) * 60)).padStart(2, '0')}
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 py-2">
        {dayItems.map((item) => {
          const Icon = LANE_ICONS[item.row_id] || ClipboardList
          const itemStartSlotGlobal = dayIndex * TIME_SLOTS.length + (item.start_slot || 0) / 6
          const itemEndSlotGlobal = itemStartSlotGlobal + (item.span || 1)
          const isPast = cursorSlot > itemEndSlotGlobal
          const isCurrent = cursorSlot >= itemStartSlotGlobal && cursorSlot <= itemEndSlotGlobal
          const startHour = item.start_slot || 0
          const endHour = startHour + ((item.span || 1) * 6)

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-left transition-all',
                isCurrent
                  ? 'border-info/50 bg-info-soft ring-1 ring-info/30'
                  : isPast
                    ? 'border-border-default/40 bg-bg-surface opacity-50'
                    : 'border-border-default bg-bg-surface hover:border-info/30'
              )}
            >
              <Icon size={10} className={cn(
                'flex-shrink-0',
                isCurrent ? 'text-info' : 'text-text-secondary'
              )} />
              <div>
                <div className={cn(
                  'text-[10px] font-bold leading-tight',
                  isCurrent ? 'text-info' : 'text-text-primary'
                )}>
                  {item.title}
                </div>
                <div className="text-[9px] text-text-secondary">
                  {String(startHour).padStart(2, '0')}:00–{String(endHour).padStart(2, '0')}:00
                </div>
              </div>
              {isCurrent && isPlaying && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const SituationView = memo(function SituationView({
  tripMeta,
  families,
  locations,
  routes,
  directionsByRoute,
  cursorSlot,
  isPlaying,
  playbackSpeed,
  onTogglePlayback,
  onRestartPlayback,
  onSetPlaybackSpeed,
  onSetCursor,
  itineraryItems,
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Map area with floating overlays */}
      <div className="relative flex-1 min-h-0">
        <MapView
          minimal
          tripMeta={tripMeta}
          families={families}
          locations={locations}
          routes={routes}
          directionsByRoute={directionsByRoute}
          cursorSlot={cursorSlot}
          isPlaying={isPlaying}
        />

        {/* Floating overlays */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <FloatingPlaybackControls
              cursorSlot={cursorSlot}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onTogglePlayback={onTogglePlayback}
              onRestartPlayback={onRestartPlayback}
              onSetPlaybackSpeed={onSetPlaybackSpeed}
            />
            <DayBadge cursorSlot={cursorSlot} />
          </div>

          {/* Bottom-left mini legend */}
          <div className="flex items-end justify-between">
            <div className="pointer-events-auto border border-border-default bg-bg-panel/80 px-2.5 py-2 shadow-lg">
              <MiniLegend />
            </div>
          </div>
        </div>
      </div>

      {/* Event feed */}
      <EventFeed items={itineraryItems} cursorSlot={cursorSlot} isPlaying={isPlaying} />

      {/* Bottom timeline panel */}
      <PlaybackBar
        cursorSlot={cursorSlot}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTogglePlayback={onTogglePlayback}
        onRestartPlayback={onRestartPlayback}
        onSetPlaybackSpeed={onSetPlaybackSpeed}
        onSetCursor={onSetCursor}
      />
    </div>
  )
})
