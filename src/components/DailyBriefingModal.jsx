import { DAY_BRIEFINGS } from '../data/seedTrip'
import { SectionTitle } from './ui/SectionTitle'
import { StatusPill } from './ui/StatusPill'
import { X } from 'lucide-react'

export function DailyBriefingModal({ dayId, items, meals, tasks, onClose, onSelectEntity }) {
  const briefing = DAY_BRIEFINGS[dayId]
  const day = items?.[0]?.day_id === dayId ? items[0] : null

  if (!briefing) return null

  const toneStyles = {
    Amber: 'border-warning/40 text-warning',
    Blue: 'border-info/40 text-info',
    Red: 'border-critical/40 text-critical',
    Green: 'border-success/40 text-success',
  }

  const dayItems = (items || []).filter((i) => i.day_id === dayId)
  const dayMeals = (meals || []).filter((m) => m.day_id === dayId)
  const dayTasks = (tasks || []).filter((t) => t.day_id === dayId && t.status !== 'done')

  const railSection = (title, children, emptyLabel) => (
    <div className="border border-border-default bg-bg-panel">
      <div className="border-b border-border-default/50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary">
        {title}
      </div>
      <div className="p-4">
        {children || <div className="text-[11px] text-text-secondary">{emptyLabel}</div>}
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-8"
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '100% 4px, 4px 100%',
        }}
      />
      <div
        className="relative max-h-full w-full max-w-5xl overflow-hidden border border-border-default bg-[#10161e] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border-default bg-[linear-gradient(135deg,rgba(88,166,255,0.08),rgba(13,17,23,0.95)_58%)] px-6 py-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-info">
                Daily Briefing
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[22px] font-black uppercase tracking-[0.14em] text-white">
                  {briefing.code}
                </h2>
                <span className={`border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${toneStyles[briefing.tone] || toneStyles.Blue}`}>
                  {briefing.tone}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 border border-border-default bg-bg-panel px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text-primary transition-colors hover:border-info/40 hover:text-info"
            >
              <X size={14} />
              Close
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="border border-border-default bg-bg-panel/85 p-4">
              <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary">Command summary</div>
              <p className="text-[13px] leading-7 text-text-primary">{briefing.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="border border-border-default bg-bg-panel p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Live now</div>
                <div className="mt-2 text-[22px] font-black text-white">{dayItems.length}</div>
              </div>
              <div className="border border-border-default bg-bg-panel p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Meals</div>
                <div className="mt-2 text-[22px] font-black text-white">{dayMeals.length}</div>
              </div>
              <div className="border border-border-default bg-bg-panel p-4 text-center">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Open tasks</div>
                <div className="mt-2 text-[22px] font-black text-white">{dayTasks.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid max-h-[calc(100vh-220px)] gap-5 overflow-y-auto p-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            {railSection(
              'Watch For',
              <div className="space-y-3">
                {briefing.lookouts.map((item, idx) => (
                  <div key={idx} className="border border-border-default bg-bg-panel px-3 py-3 text-[11px] leading-relaxed text-text-primary">
                    {item}
                  </div>
                ))}
              </div>,
              'No lookouts defined.'
            )}

            {railSection(
              'Itinerary',
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onSelectEntity?.('itinerary', item); onClose() }}
                    className="flex w-full items-start justify-between gap-3 border border-border-default bg-bg-surface px-3 py-3 text-left transition-colors hover:border-info/40"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-text-primary">{item.title}</div>
                      <div className="mt-1 text-[10px] text-text-secondary">{item.row_id} · slot {item.start_slot}</div>
                    </div>
                  </button>
                ))}
              </div>,
              'No itinerary items for this day.'
            )}
          </div>

          <div className="space-y-5">
            {railSection(
              'Planned beats',
              <div className="space-y-3">
                {dayMeals.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => { onSelectEntity?.('meal', meal); onClose() }}
                    className="flex w-full items-start justify-between gap-3 border border-border-default bg-bg-panel px-3 py-3 text-left transition-colors hover:border-info/40"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-primary">{meal.meal}</div>
                      <div className="mt-1 text-[10px] text-text-secondary">{meal.owner}</div>
                    </div>
                    <StatusPill status={meal.status}>{meal.status}</StatusPill>
                  </button>
                ))}
                {!dayMeals.length && <div className="text-[11px] text-text-secondary">No meals scheduled.</div>}
              </div>,
              'No meals scheduled.'
            )}

            {railSection(
              'Open loops',
              <div className="space-y-2">
                {dayTasks.length ? dayTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => { onSelectEntity?.('task', task); onClose() }}
                    className="w-full border border-border-default bg-bg-panel px-3 py-3 text-left text-[11px] text-text-primary transition-colors hover:border-info/40"
                  >
                    {task.title}
                  </button>
                )) : (
                  <div className="text-[11px] text-text-secondary">No open tasks. Good hunting.</div>
                )}
              </div>,
              'No open tasks.'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
