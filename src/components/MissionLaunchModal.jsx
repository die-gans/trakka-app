import { useEffect, useState } from 'react'
import { Flag, Route, Users, X } from 'lucide-react'
import { getMissionLaunchTheme, getSlotLabel } from '../lib/timeline-helpers'
import { DAYS } from '../data/seedTrip'

export function MissionLaunchModal({ gate, onProceed, onAbort }) {
  const [remainingMs, setRemainingMs] = useState(gate?.autoAdvanceMs || 4200)

  useEffect(() => {
    if (!gate) return
    const raf = requestAnimationFrame(() => setRemainingMs(gate.autoAdvanceMs || 4200))
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max((gate.autoAdvanceMs || 4200) - elapsed, 0)
      setRemainingMs(remaining)
      if (remaining <= 0) {
        window.clearInterval(intervalId)
        onProceed()
      }
    }, 80)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(intervalId)
    }
  }, [gate, onProceed])

  if (!gate) return null

  const theme = getMissionLaunchTheme(gate.dayId)
  const totalMs = gate.autoAdvanceMs || 4200
  const progress = Math.min(Math.max(1 - remainingMs / totalMs, 0), 1)
  const radius = 76
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const countdownValue = Math.max(1, 3 - Math.min(2, Math.floor(progress * 3)))
  const dayMeta = DAYS.find((d) => d.id === gate.dayId)

  const statusCards = [
    { label: 'Launch', value: getSlotLabel(gate.startSlot), icon: Flag },
    { label: 'ETA', value: gate.dayLabel || dayMeta?.title || '', icon: Route },
    { label: 'Units', value: '3', icon: Users },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-6 py-8"
      style={{ background: 'rgba(3, 7, 11, 0.28)', backdropFilter: 'blur(2px)' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 42%, ${theme.accentGlow}, transparent 24%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(3,7,11,0.12), rgba(3,7,11,0.82))`,
          backgroundSize: '100% 100%, 100% 9px, 9px 100%, 100% 100%',
        }}
      />
      <div
        className="relative w-full max-w-[720px] overflow-hidden border shadow-[0_30px_96px_rgba(0,0,0,0.62)]"
        style={{
          borderColor: theme.accentBorder,
          background: 'linear-gradient(180deg, rgba(7,11,17,0.86), rgba(4,8,13,0.94))',
          boxShadow: `0 30px 96px rgba(0, 0, 0, 0.62), 0 0 0 1px ${theme.panelGlow}`,
          animation: 'mission-launch-panel-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(120deg, ${theme.accentSoft}, transparent 38%), radial-gradient(circle at 78% 18%, ${theme.panelGlow}, transparent 24%)`,
          }}
        />

        <div className="relative border-b border-white/[0.08] px-7 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: theme.accentText }}>
                {dayMeta?.title || gate.dayLabel} Mission Launch
              </div>
              <div className="mt-2 text-[12px] font-black uppercase tracking-[0.18em] text-text-secondary">
                {gate.subtitle}
              </div>
            </div>
            <button
              type="button"
              onClick={onAbort}
              className="inline-flex items-center gap-2 border border-border-default bg-bg-panel px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text-primary transition-colors hover:border-info/40 hover:text-info"
            >
              <X size={14} />
              Abort
            </button>
          </div>

          <div className="mt-5">
            <div className="text-[32px] font-black uppercase tracking-[0.05em] text-white sm:text-[38px]">
              {gate.title}
            </div>
            <div className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-text-primary">
              {gate.subtitle} — {dayMeta?.title || ''} primary operation commencing.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusCards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className="inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-semibold text-white"
                    style={{
                      borderColor: theme.accentBorder,
                      background: 'rgba(12, 17, 24, 0.72)',
                    }}
                  >
                    <Icon size={12} style={{ color: theme.accentText }} />
                    <span className="uppercase tracking-[0.14em] text-text-secondary">{card.label}</span>
                    <span>{card.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative grid gap-6 px-7 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
          <div className="flex items-center justify-center">
            <div
              className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border"
              style={{
                borderColor: theme.accentBorder,
                background: `radial-gradient(circle, ${theme.accentSoft}, rgba(8,12,18,0.12) 60%, transparent 75%)`,
                animation: 'mission-launch-halo 2.6s ease-in-out infinite',
              }}
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 190 190">
                <circle cx="95" cy="95" r={radius} fill="none" stroke="rgba(48,54,61,0.72)" strokeWidth="9" />
                <circle
                  cx="95" cy="95" r={radius} fill="none"
                  stroke={theme.accentStrong} strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-[16px] rounded-full border border-white/[0.08]" />
              <div className="relative text-center">
                <div className="text-[8px] font-black uppercase tracking-[0.22em] text-text-secondary">Launch In</div>
                <div
                  key={countdownValue}
                  className="mt-2 text-[78px] font-black leading-none text-white"
                  style={{ animation: 'mission-launch-digit-in 220ms ease-out' }}
                >
                  {countdownValue}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[13px] leading-7 text-text-primary">
              All units should be ready for {gate.title.toLowerCase()}. Playback will resume automatically.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onProceed}
                className="border px-5 py-2 text-[11px] font-black uppercase tracking-wider transition-colors hover:opacity-90"
                style={{ borderColor: theme.accentBorder, background: theme.accentSoft, color: theme.accentText }}
              >
                Proceed
              </button>
              <button
                type="button"
                onClick={onAbort}
                className="border border-border-default bg-bg-panel px-5 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
              >
                Pause Playback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
