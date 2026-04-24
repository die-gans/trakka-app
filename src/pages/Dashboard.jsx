import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NavRail } from '../components/ui/NavRail'
import { TopBar } from '../components/ui/TopBar'
import { SectionTitle } from '../components/ui/SectionTitle'
import { StatusPill } from '../components/ui/StatusPill'
import { WeatherWidget } from '../components/WeatherWidget'
import { MapView } from '../components/MapView'
import InspectorRail from '../components/InspectorRail'
import {
  useTrip,
  useFamilies,
  useMeals,
  useTasks,
  useExpenses,
  useTripPermission,
  useTripMembers,
  useLocations,
} from '../hooks/useTripData'
import { DAYS } from '../data/seedTrip'
import { signOut } from '../lib/supabase'
import { cn } from '../lib/utils'
import { createTask, updateMeal, updateTask, updateExpense } from '../lib/supabase-crud'

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center border border-dashed border-border-default bg-bg-panel">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{title}</div>
      <div className="mt-1 text-[11px] text-text-secondary">{subtitle}</div>
    </div>
  )
}

function FamiliesView({ families, loading, onToggleChecklist, onUpdateReadiness, onSelectEntity, isEditor }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Units" title="Convoy Status" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading units...</div>
      </div>
    )
  }

  if (families.length === 0) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Units" title="Convoy Status" meta="0 units" />
        <div className="mt-4">
          <EmptyState title="No Units" subtitle="Add family units in trip settings" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Units" title="Convoy Status" meta={`${families.length} units`} />
      <div className="grid gap-3">
        {families.map((family) => (
          <button
            key={family.id}
            onClick={() => onSelectEntity('family', family)}
            className="border border-border-default bg-bg-surface p-4 text-left transition-colors hover:border-info/40 hover:bg-bg-panel"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">
                    {family.short_origin || family.shortOrigin}
                  </span>
                  <h3 className="text-[14px] font-black uppercase tracking-[0.1em] text-text-primary">
                    {family.name}
                  </h3>
                </div>
                <div className="mt-1 text-[11px] text-text-secondary">
                  {family.headcount} · {family.vehicle} · {family.drive_time || family.driveTime}
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
                  {family.readiness || 0}%
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
                      disabled={!isEditor}
                      onClick={async () => {
                        await onToggleChecklist(item.id, !item.done)
                        await onUpdateReadiness(family.id)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 text-left text-[11px]',
                        !isEditor && 'cursor-default opacity-60'
                      )}
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
          </button>
        ))}
      </div>
    </div>
  )
}

function MealsView({ meals, loading, onUpdateStatus, onSelectEntity, isEditor }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Meal Plan" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading meals...</div>
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Meal Plan" meta="0 meals" />
        <div className="mt-4">
          <EmptyState title="No Meals" subtitle="Meals will appear here once added" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Logistics" title="Meal Plan" meta={`${meals.length} meals`} />
      <div className="grid gap-2">
        {meals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => onSelectEntity('meal', meal)}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 text-left transition-colors hover:border-info/40 hover:bg-bg-panel"
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
                disabled={!isEditor}
                onClick={() => {
                  const statuses = ['Pending', 'Assigned', 'Settled']
                  const nextStatus = statuses[(statuses.indexOf(meal.status) + 1) % statuses.length]
                  onUpdateStatus(meal.id, nextStatus)
                }}
                className={cn(!isEditor && 'cursor-default opacity-60')}
              >
                <StatusPill tone={meal.status}>{meal.status}</StatusPill>
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function TasksView({ tasks, loading, onToggleStatus, onSelectEntity, isEditor }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Operations" title="Task Board" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading tasks...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Operations" title="Task Board" meta="0 tasks" />
        <div className="mt-4">
          <EmptyState title="No Tasks" subtitle="Tasks will appear here once added" />
        </div>
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
          <div
            key={task.id}
            onClick={() => onSelectEntity('task', task)}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 text-left transition-colors hover:border-info/40 hover:bg-bg-panel cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <button
                disabled={!isEditor}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStatus(task.id, task.status)
                }}
                className={cn(
                  'h-4 w-4 border flex items-center justify-center',
                  !isEditor && 'cursor-default opacity-60',
                  task.status === 'done'
                    ? 'border-success bg-success-soft text-success'
                    : 'border-border-default bg-bg-panel'
                )}
              >
                {task.status === 'done' && '✓'}
              </button>
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
          </div>
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
          lat={-35.1333}
          lng={150.7000}
          locationName="Jervis Bay, NSW"
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

function ExpensesView({ expenses, loading, onSelectEntity }) {
  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Expenses" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading expenses...</div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Expenses" meta="$0 total" />
        <div className="mt-4">
          <EmptyState title="No Expenses" subtitle="Expenses will appear here once added" />
        </div>
      </div>
    )
  }

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="p-6">
      <SectionTitle eyebrow="Logistics" title="Expenses" meta={`$${total.toFixed(0)} total`} />
      <div className="grid gap-2">
        {expenses.map((expense) => (
          <button
            key={expense.id}
            onClick={() => onSelectEntity('expense', expense)}
            className="flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 text-left transition-colors hover:border-info/40 hover:bg-bg-panel"
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
          </button>
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
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [activePage, setActivePage] = useState('families')
  const [activeFamily, setActiveFamily] = useState('sydney-crew')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntity, setSelectedEntity] = useState(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  // Load trip data
  const { trip, loading: tripLoading } = useTrip(tripId)

  // Permissions & members
  const { isEditor, permission, role } = useTripPermission(tripId)
  const { members, loading: membersLoading } = useTripMembers(tripId)

  // Live data from Supabase
  const {
    families,
    loading: familiesLoading,
    toggleChecklist,
    updateReadiness,
    refresh: refreshFamilies,
  } = useFamilies(tripId)

  const {
    meals,
    loading: mealsLoading,
    updateStatus: updateMealStatus,
    refresh: refreshMeals,
  } = useMeals(tripId)

  const {
    tasks,
    loading: tasksLoading,
    toggleStatus: toggleTaskStatus,
    refresh: refreshTasks,
  } = useTasks(tripId)

  const {
    expenses,
    loading: expensesLoading,
    refresh: refreshExpenses,
  } = useExpenses(tripId)

  const {
    locations,
    loading: locationsLoading,
  } = useLocations(tripId)

  // Entity selection handler
  const handleSelectEntity = (type, data) => {
    setSelectedEntity({ type, ...data })
  }

  const handleClearSelection = () => {
    setSelectedEntity(null)
  }

  // Add task linked to entity
  const handleAddTask = async (task) => {
    try {
      await createTask(task)
      refreshTasks()
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  // Toggle meal status with cycle
  const handleToggleMealStatus = async (mealId, currentStatus) => {
    const statuses = ['Pending', 'Assigned', 'Settled']
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length]
    try {
      await updateMeal(mealId, { status: nextStatus })
      refreshMeals()
    } catch (err) {
      console.error('Failed to update meal:', err)
    }
  }

  // Toggle task status
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'open' : 'done'
    try {
      await updateTask(taskId, { status: newStatus })
      refreshTasks()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  // Toggle expense settled
  const handleToggleExpenseSettled = async (expenseId, settled) => {
    try {
      await updateExpense(expenseId, { settled })
      refreshExpenses()
    } catch (err) {
      console.error('Failed to update expense:', err)
    }
  }

  // Update entity note
  const handleUpdateEntityNote = async (type, id, note) => {
    try {
      if (type === 'meal') await updateMeal(id, { note })
      // Note: other entities don't have note field in current schema
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  // Build trip meta from loaded data
  const tripMeta = trip ? {
    id: trip.id,
    title: trip.title,
    commandName: trip.command_name || trip.title,
    startDate: trip.start_date,
    endDate: trip.end_date,
    basecampAddress: trip.basecamp_address || '',
    basecampCoordinates: {
      lat: trip.basecamp_lat || -35.1333,
      lng: trip.basecamp_lng || 150.7000,
    },
  } : {
    commandName: 'Loading...',
    basecampAddress: '',
    basecampCoordinates: { lat: -35.1333, lng: 150.7000 },
  }

  const renderPage = () => {
    switch (activePage) {
      case 'families':
        return (
          <FamiliesView
            families={families}
            loading={familiesLoading}
            onToggleChecklist={toggleChecklist}
            onUpdateReadiness={updateReadiness}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
          />
        )
      case 'meals':
        return (
          <MealsView
            meals={meals}
            loading={mealsLoading}
            onUpdateStatus={updateMealStatus}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
          />
        )
      case 'itinerary':
        return <ItineraryView days={DAYS} />
      case 'map':
        return (
          <MapView
            tripMeta={tripMeta}
            families={families}
          />
        )
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            loading={tasksLoading}
            onToggleStatus={toggleTaskStatus}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
          />
        )
      case 'expenses':
        return (
          <ExpensesView
            expenses={expenses}
            loading={expensesLoading}
            onSelectEntity={handleSelectEntity}
          />
        )
      case 'activities':
        return <PlaceholderView title="Activities" subtitle="Main Ops" />
      case 'stay':
        return <PlaceholderView title="Stay" subtitle="Basecamp Intel" />
      default:
        return (
          <FamiliesView
            families={families}
            loading={familiesLoading}
            onToggleChecklist={toggleChecklist}
            onUpdateReadiness={updateReadiness}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
          />
        )
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      <NavRail activePage={activePage} onPageChange={setActivePage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          tripName={tripMeta.commandName}
          families={families}
          activeFamily={activeFamily}
          onFamilyChange={setActiveFamily}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSignOut={handleSignOut}
        />
        <div className="flex min-h-0 flex-1 overflow-auto">
          <div className="flex-1">
            {renderPage()}
          </div>
          {/* Inspector rail */}
          <InspectorRail
            selectedEntity={selectedEntity}
            onClearSelection={handleClearSelection}
            tripId={tripId}
            families={families}
            meals={meals}
            tasks={tasks}
            expenses={expenses}
            locations={locations}
            members={members}
            membersLoading={membersLoading}
            isEditor={isEditor}
            role={role}
            onToggleMealStatus={handleToggleMealStatus}
            onToggleTaskStatus={handleToggleTaskStatus}
            onToggleExpenseSettled={handleToggleExpenseSettled}
            onAddTask={handleAddTask}
            onUpdateEntityNote={handleUpdateEntityNote}
          />
        </div>
      </div>
    </div>
  )
}
