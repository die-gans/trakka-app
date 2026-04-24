import { useState } from 'react'
import { NavRail } from '../components/ui/NavRail'
import { TopBar } from '../components/ui/TopBar'
import { SectionTitle } from '../components/ui/SectionTitle'
import { StatusPill } from '../components/ui/StatusPill'
import { WeatherWidget } from '../components/WeatherWidget'
import {
  useFamilies,
  useMeals,
  useTasks,
  useExpenses,
} from '../hooks/useTripData'
import {
  TRIP_META,
  DAYS,
  INITIAL_FAMILIES as SEED_FAMILIES,
  INITIAL_MEALS as SEED_MEALS,
  INITIAL_TASKS as SEED_TASKS,
} from '../data/seedTrip'
import { cn } from '../lib/utils'

function FamiliesView({ families, loading, onToggleChecklist, onUpdateReadiness }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Units" title="Convoy Status" />
        <div className="text-[11px] text-text-secondary">Loading units...</div>
      </div>
    )
  }

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
                    {family.short_origin}
                  </span>
                  <h3 className="text-[14px] font-black uppercase tracking-[0.1em] text-text-primary">
                    {family.name}
                  </h3>
                </div>
                <div className="mt-1 text-[11px] text-text-secondary">
                  {family.headcount} · {family.vehicle} · {family.drive_time}
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
                  {family.checklist_items?.filter((c) => c.done).length || 0}/{family.checklist_items?.length || 0}
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

            {family.checklist_items?.length > 0 && (
              <div className="mt-3">
                <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-1">
                  Pre-Departure Checklist
                </div>
                <div className="space-y-1">
                  {family.checklist_items.map((item) => (
                    <button
                      key={item.id}
                      onClick={async () => {
                        await onToggleChecklist(item.id, !item.done)
                        await onUpdateReadiness(family.id)
                      }}
                      className="flex w-full items-center gap-2 text-left text-[11px]"
                    >
                      <span className={cn(
                        'h-3.5 w-3.5 border flex items-center justify-center text-[10px]',
                        item.done
                          ? 'border-success bg-success-soft text-success'
                          : 'border-border-default bg-bg-panel'
                      )}>
                        {item.done && '✓'}
                      </span>
                      <span className={item.done ? 'text-text-secondary line-through' : 'text-text-primary'}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MealsView({ meals, loading, onUpdateStatus }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Meal Plan" />
        <div className="text-[11px] text-text-secondary">Loading meals...</div>
      </div>
    )
  }

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
                {meal.day_id?.toUpperCase()}
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
              <button
                onClick={() => {
                  const statuses = ['Pending', 'Assigned', 'Settled']
                  const nextStatus = statuses[(statuses.indexOf(meal.status) + 1) % statuses.length]
                  onUpdateStatus(meal.id, nextStatus)
                }}
              >
                <StatusPill tone={meal.status}>{meal.status}</StatusPill>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksView({ tasks, loading, onToggleStatus }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Operations" title="Task Board" />
        <div className="text-[11px] text-text-secondary">Loading tasks...</div>
      </div>
    )
  }

  const pending = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Operations" title="Task Board" meta={`${pending.length} open · ${done.length} done`} />
      <div className="grid gap-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggleStatus(task.id, task.status)}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                'h-4 w-4 border flex items-center justify-center',
                task.status === 'done'
                  ? 'border-success bg-success-soft text-success'
                  : 'border-border-default bg-bg-panel'
              )}>
                {task.status === 'done' && '✓'}
              </span>
              <div>
                <div className={cn(
                  'text-[12px] font-bold',
                  task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'
                )}>
                  {task.title}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  {task.day_id?.toUpperCase()} · {task.assigned_family_id ? 'Assigned' : 'Unassigned'}
                </div>
              </div>
            </div>
            <StatusPill tone={task.status === 'done' ? 'done' : 'open'}>
              {task.status === 'done' ? 'Done' : 'Open'}
            </StatusPill>
          </button>
        ))}
      </div>
    </div>
  )
}

function ItineraryView({ days }) {
  return (
    <div className="p-6">
      <SectionTitle eyebrow="Timeline" title="Mission Timeline" meta="4 days · 6-hour slots" />

      {/* Weather Widget */}
      <div className="mb-6">
        <WeatherWidget
          lat={TRIP_META.basecampCoordinates.lat}
          lng={TRIP_META.basecampCoordinates.lng}
          locationName={TRIP_META.basecampAddress}
        />
      </div>

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

function ExpensesView({ expenses, loading }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Expenses" />
        <div className="text-[11px] text-text-secondary">Loading expenses...</div>
      </div>
    )
  }

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Logistics" title="Expenses" meta={`$${total.toFixed(0)} total`} />
      <div className="grid gap-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3"
          >
            <div>
              <div className="text-[13px] font-bold text-text-primary">
                {expense.title}
              </div>
              <div className="text-[10px] text-text-secondary">
                Paid by {expense.payer_family_id}
              </div>
            </div>
            <div className="text-[14px] font-black text-text-primary">
              ${expense.amount?.toFixed(2)}
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

  // Live data from Supabase
  const {
    families,
    loading: familiesLoading,
    toggleChecklist,
    updateReadiness,
  } = useFamilies()

  const {
    meals,
    loading: mealsLoading,
    updateStatus: updateMealStatus,
  } = useMeals()

  const {
    tasks,
    loading: tasksLoading,
    toggleStatus: toggleTaskStatus,
  } = useTasks()

  const {
    expenses,
    loading: expensesLoading,
  } = useExpenses()

  // Fallback to seed data if Supabase is empty (for demo)
  const displayFamilies = families.length > 0 ? families : SEED_FAMILIES
  const displayMeals = meals.length > 0 ? meals : SEED_MEALS
  const displayTasks = tasks.length > 0 ? tasks : SEED_TASKS

  const renderPage = () => {
    switch (activePage) {
      case 'families':
        return (
          <FamiliesView
            families={displayFamilies}
            loading={familiesLoading && families.length === 0}
            onToggleChecklist={toggleChecklist}
            onUpdateReadiness={updateReadiness}
          />
        )
      case 'meals':
        return (
          <MealsView
            meals={displayMeals}
            loading={mealsLoading && meals.length === 0}
            onUpdateStatus={updateMealStatus}
          />
        )
      case 'itinerary':
        return <ItineraryView days={DAYS} />
      case 'tasks':
        return (
          <TasksView
            tasks={displayTasks}
            loading={tasksLoading && tasks.length === 0}
            onToggleStatus={toggleTaskStatus}
          />
        )
      case 'expenses':
        return (
          <ExpensesView
            expenses={expenses}
            loading={expensesLoading && expenses.length === 0}
          />
        )
      case 'activities':
        return <PlaceholderView title="Activities" subtitle="Main Ops" />
      case 'stay':
        return <PlaceholderView title="Stay" subtitle="Basecamp Intel" />
      default:
        return (
          <FamiliesView
            families={displayFamilies}
            loading={familiesLoading}
            onToggleChecklist={toggleChecklist}
            onUpdateReadiness={updateReadiness}
          />
        )
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      <NavRail activePage={activePage} onPageChange={setActivePage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tripName={TRIP_META.commandName}
          families={SEED_FAMILIES}
          activeFamily={activeFamily}
          onFamilyChange={setActiveFamily}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex min-h-0 flex-1 overflow-auto">
          <div className="flex-1">
            {renderPage()}
          </div>
          {/* Inspector rail */}
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
