import { memo } from 'react'
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react'
import { DAYS, TIME_SLOTS } from '../data/seedTrip'
import { getSlotLabel } from '../lib/timeline-helpers'

export const PlaybackBar = memo(function PlaybackBar({
  cursorSlot,
  isPlaying,
  playbackSpeed,
  onTogglePlayback,
  onRestartPlayback,
  onSetPlaybackSpeed,
  onSetCursor,
}) {
  const totalSlots = DAYS.length * TIME_SLOTS.length
  const currentLabel = getSlotLabel(cursorSlot)

  return (
    <div className="border-t border-border-default bg-bg-surface">
      {/* Top row: controls + day strip */}
      <div className="flex h-12 items-center border-b border-border-default/50">
        {/* Playback controls */}
        <div className="flex w-36 flex-col justify-center gap-1 border-r border-border-default bg-bg-panel/50 px-3">
          <div className="flex items-center justify-center gap-1.5">
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
              title="Restart playback from trip start"
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
              <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                {playbackSpeed}x
              </span>
            </button>
          </div>
          <div className="text-center text-[9px] font-bold tracking-wider text-text-secondary">
            {currentLabel}
          </div>
        </div>

        {/* Day weather strip */}
        <div className="flex flex-1 divide-x divide-border-default/30">
          {DAYS.map((day) => (
            <div key={day.id} className="flex flex-1 items-center gap-3 px-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-tighter text-text-secondary">{day.weather}</div>
                <div className="text-[11px] font-bold text-text-primary">{day.temperature}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrubber */}
      <div
        className="relative h-8 bg-bg-panel/50 cursor-col-resize"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 0.999999)
          onSetCursor?.(ratio * totalSlots)
        }}
      >
        {DAYS.map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-border-default/30"
            style={{ left: `${(i / DAYS.length) * 100}%` }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-info z-10 pointer-events-none"
          style={{
            left: `${(cursorSlot / totalSlots) * 100}%`,
            boxShadow: '0 0 6px rgba(88,166,255,0.5)',
          }}
        />
      </div>
    </div>
  )
})
