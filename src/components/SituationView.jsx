import { memo } from 'react'
import { Play, Pause, RotateCcw, Gauge, Sun, Cloud, CloudRain, CloudSun } from 'lucide-react'
import { MapView } from './MapView'
import { PlaybackBar } from './PlaybackBar'
import { DAYS, TIME_SLOTS } from '../data/seedTrip'
import { getSlotLabel, getCursorDay } from '../lib/timeline-helpers'
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
    <div className="pointer-events-auto flex items-center gap-2 border border-border-default bg-bg-panel/90 px-3 py-2 shadow-lg">
      <button
        type="button"
        onClick={onTogglePlayback}
        className="inline-flex h-7 w-7 items-center justify-center border border-info/40 bg-info-soft text-info transition-colors hover:border-info"
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
