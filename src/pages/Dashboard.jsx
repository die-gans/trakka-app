import { useState } from 'react'
import { NavRail } from '../components/ui/NavRail'
import { TopBar } from '../components/ui/TopBar'
import { SectionTitle } from '../components/ui/SectionTitle'
import { StatusPill } from '../components/ui/StatusPill'
import {
  TRIP_META,
  DAYS,
  INITIAL_FAMILIES,
  INITIAL_MEALS,
  INITIAL_TASKS,
} from '../data/seedTrip'

function FamiliesView({ families }) {
  return (
    <div className="p-6">
      <SectionTitle eyebrow="Units" title="Convoy Status" meta={`${families.length} units`} />
      <div className="grid gap-3">
        {families.map((family) => (
          <div
            key={family.id}
            className="border border-border-default bg-bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">
                    {family.shortOrigin}
                  </span>
                  <h3 className="text-[14px] font-black uppercase tracking-[0.1em] text-text-primary">
                    {family.name}
                  </h3>
                </div>
                <div className="mt-1 text-[11px] text-text-secondary">
                  {family.headcount} · {family.vehicle} · {family.driveTime}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={family.status}>{family.status}</StatusPill>
                <div className="text-[10px] font-bold text-text-secondary">
                  {family.eta}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="border border-border-default bg-bg-panel p-2">
                <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                  Readiness
                </div>
                <div className={`mt-1 text-[16px] font-black ${family.readiness >= 80 ? 'text-success' : family.readiness >= 60 ? 'text-warning' : 'text-critical'}`}>
                  {family.readiness}%
                </div>
              </div>
              <div className="border border-border-default bg-bg-panel p-2">
                <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                  Checklist
                </div>
                <div className="mt-1 text-[16px] font-black text-info">
                  {family.checklist.filter((c) => c.done).length}/{family.checklist.length}
                </div>
              </div>
              <div className="border border-border-default bg-bg-panel p-2">
                <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                  Responsibility
                </div>
                <div className="mt-1 text-[10px] font-bold text-text-primary">
                  {family.responsibility}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-1">
                Pre-Departure Checklist
              </div>
              <div className="space-y-1">
                {family.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-[11px]"
                  >
                    <span className={`h-3.5 w-3.5 border ${item.done ? 'border-success bg-success-soft text-success' : 'border-border-default bg-bg-panel'}`}>
                      {item.done && '✓'}
                    </span>
                    <span className={item.done ? 'text-text-secondary line-through' : 'text-text-primary'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MealsView({ meals }) {
  return (
    <div className="p-6">
      <SectionTitle eyebrow="Logistics" title="Meal Plan" meta={`${meals.length} meals`} />
      <div className="grid gap-2">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3"
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                {meal.dayId.toUpperCase()}
              </div>
              <div className="text-[13px] font-bold text-text-primary">
                {meal.meal}
              </div>
              {meal.note && (
                <div className="mt-0.5 text-[10px] text-text-secondary">
                  {meal.note}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-bold text-text-secondary">
                {meal.owner}
              </div>
              <StatusPill tone={meal.status}>{meal.status}</StatusPill>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksView({ tasks }) {
  const pending = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Operations" title="Task Board" meta={`${pending.length} open · ${done.length} done`} />
      <div className="grid gap-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 border ${task.status === 'done' ? 'border-success bg-success-soft text-success' : 'border-border-default bg-bg-panel'}`}>
                {task.status === 'done' && '✓'}
              </span>
              <div>
                <div className={`text-[12px] font-bold ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {task.title}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  {task.dayId.toUpperCase()} · {task.assignedFamilyId?.replace('-', ' ')}
                </div>
              </div>
            </div>
            <StatusPill tone={task.status === 'done' ? 'done' : 'open'}>
              {task.status === 'done' ? 'Done' : 'Open'}
            </StatusPill>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItineraryView({ days, families }) {
  return (
    <div className="p-6">
      <SectionTitle eyebrow="Timeline" title="Mission Timeline" meta="4 days · 6-hour slots" />
      <div className="grid gap-4">
        {days.map((day) => (
          <div key={day.id} className="border border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-default bg-bg-panel px-4 py-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-info">
                  {day.shortLabel}
                </span>
                <span className="text-[12px] font-bold text-text-primary">
                  {day.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary">{day.weather}</span>
                <span className="text-[10px] font-bold text-text-secondary">{day.temperature}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {['00:00', '06:00', '12:00', '18:00'].map((slot) => (
                  <div key={slot} className="border border-border-default bg-bg-panel p-2">
                    <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-1">
                      {slot}
                    </div>
                    <div className="h-12 text-[10px] text-text-muted">
                      —
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaceholderView({ title, subtitle }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-info mb-2">
        {subtitle}
      </div>
      <div className="text-[16px] font-black uppercase tracking-[0.1em] text-text-primary">
        {title}
      </div>
      <div className="mt-2 text-[11px] text-text-secondary">
        This view is coming in v0.2
      </div>
    </div>
  )
}

export function Dashboard() {
  const [activePage, setActivePage] = useState('families')
  const [activeFamily, setActiveFamily] = useState('sydney-crew')
  const [searchQuery, setSearchQuery] = useState('')

  const renderPage = () => {
    switch (activePage) {
      case 'families':
        return <FamiliesView families={INITIAL_FAMILIES} />
      case 'meals':
        return <MealsView meals={INITIAL_MEALS} />
      case 'itinerary':
        return <ItineraryView days={DAYS} families={INITIAL_FAMILIES} />
      case 'activities':
        return <PlaceholderView title="Activities" subtitle="Main Ops" />
      case 'stay':
        return <PlaceholderView title="Stay" subtitle="Basecamp Intel" />
      case 'expenses':
        return <PlaceholderView title="Expenses" subtitle="Logistics" />
      default:
        return <FamiliesView families={INITIAL_FAMILIES} />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      <NavRail activePage={activePage} onPageChange={setActivePage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tripName={TRIP_META.commandName}
          families={INITIAL_FAMILIES}
          activeFamily={activeFamily}
          onFamilyChange={setActiveFamily}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex min-h-0 flex-1 overflow-auto">
          <div className="flex-1">
            {renderPage()}
          </div>
          {/* Inspector rail placeholder */}
          <div className="hidden w-80 border-l border-border-default bg-bg-surface xl:block">
            <div className="p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-info mb-2">
                Inspector
              </div>
              <div className="text-[12px] font-bold text-text-secondary">
                Select an item to inspect
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
