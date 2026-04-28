import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NavRail } from '../components/ui/NavRail'
import { TopBar } from '../components/ui/TopBar'
import { SectionTitle } from '../components/ui/SectionTitle'
import { StatusPill } from '../components/ui/StatusPill'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineModal } from '../components/ui/InlineModal'
import { FormField } from '../components/ui/FormField'
import { TextInput } from '../components/ui/TextInput'
import { SelectField } from '../components/ui/SelectField'
import { WeatherWidget } from '../components/WeatherWidget'
import { MapView } from '../components/MapView'
import { PlaybackBar } from '../components/PlaybackBar'
import { SituationView } from '../components/SituationView'
import { MissionLaunchModal } from '../components/MissionLaunchModal'
import { DailyBriefingModal } from '../components/DailyBriefingModal'
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
  useRoutes,
  useItineraryItems,
  useAllDirections,
} from '../hooks/useTripData'
import { DAYS, TIME_SLOTS } from '../data/seedTrip'
import { formatDuration, formatDistance } from '../lib/directions'
import {
  clampTimelineCursor,
  buildOperationCheckpoints,
  findCrossedCheckpoint,
  getSuggestedPlaybackStart,

  PLAYBACK_SLOT_UNITS_PER_SECOND,
  PLAYBACK_MAX_FRAME_DELTA_SECONDS,
  PLAYBACK_STALL_RESET_SECONDS,
} from '../lib/timeline-helpers'
import { signOut } from '../lib/supabase'
import { cn } from '../lib/utils'
import {
  createTask,
  updateMeal,
  updateTask,
  updateExpense,
  createMeal,
  createExpense,
  deleteMeal,
  deleteTask,
  deleteExpense,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
} from '../lib/supabase-crud'
import { Plus, Trash2, Pencil, FileText, ChevronDown, ChevronUp, Route } from 'lucide-react'



/* ─── Drive Plan (per family) ─── */
function DrivePlan({ family, routes, directionsByRoute }) {
  const [expanded, setExpanded] = useState(false)
  const route = routes?.find((r) => r.familyId === family.id || r.family_id === family.id)
  const dir = route ? directionsByRoute?.[route.id] : null
  const waypoints = route?.waypoints || []
  const legs = dir?.legs || []

  if (waypoints.length < 2) return null

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
        className="flex w-full items-center justify-between border border-border-default bg-bg-panel px-3 py-2 text-left transition-colors hover:border-info/40"
      >
        <div className="flex items-center gap-2">
          <Route size={13} className="text-info" />
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Drive Plan</span>
          {dir && (
            <span className="text-[10px] font-bold text-text-primary">
              {formatDistance(dir.distanceMeters)} · {formatDuration(dir.durationSeconds)}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={13} className="text-text-secondary" /> : <ChevronDown size={13} className="text-text-secondary" />}
      </button>

      {expanded && (
        <div className="border border-t-0 border-border-default bg-bg-surface p-3">
          {/* Waypoint timeline */}
          <div className="space-y-0">
            {waypoints.map((wp, idx) => {
              const isLast = idx === waypoints.length - 1
              const leg = legs[idx]
              const prevLegsDuration = legs.slice(0, idx).reduce((s, l) => s + (l?.duration || 0), 0)
              const cumulativeMin = Math.round(prevLegsDuration / 60)
              const hour = Math.floor(cumulativeMin / 60)
              const min = cumulativeMin % 60
              const eta = idx === 0 ? 'Departure' : `+${hour > 0 ? `${hour}h ` : ''}${min}m`

              return (
                <div key={idx} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'h-2.5 w-2.5 rounded-full border-2',
                      idx === 0 ? 'border-success bg-success-soft' : isLast ? 'border-info bg-info-soft' : 'border-warning bg-warning-soft'
                    )} />
                    {!isLast && <div className="mt-1 w-px flex-1 bg-border-default/50" />}
                  </div>
                  {/* Content */}
                  <div className={cn('pb-3', isLast && 'pb-0')}>
                    <div className="text-[11px] font-bold text-text-primary">{wp.name}</div>
                    <div className="text-[10px] text-text-secondary">
                      {eta}
                      {leg && (
                        <span className="ml-2">
                          {formatDistance(leg.distance)} · {formatDuration(leg.duration)}
                        </span>
                      )}
                    </div>
                    {leg?.summary && (
                      <div className="mt-0.5 text-[9px] text-text-muted">{leg.summary}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          {dir && (
            <div className="mt-2 border-t border-border-default/50 pt-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-black uppercase tracking-wider text-text-secondary">Total</span>
                <span className="font-bold text-text-primary">
                  {formatDistance(dir.distanceMeters)} · {formatDuration(dir.durationSeconds)}
                </span>
              </div>
            </div>
          )}

          {!dir && (
            <div className="mt-2 text-[10px] text-text-muted">
              Calculating route...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Families View ─── */
function FamiliesView({ families, loading, onToggleChecklist, onUpdateReadiness, onSelectEntity, isEditor, routes, directionsByRoute }) {
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
          <div
            key={family.id}
            className="border border-border-default bg-bg-surface p-4 text-left transition-colors hover:border-info/40 hover:bg-bg-panel"
          >
            <button
              type="button"
              onClick={() => onSelectEntity('family', family)}
              className="flex w-full items-start justify-between text-left"
            >
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
            </button>

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

            <DrivePlan family={family} routes={routes} directionsByRoute={directionsByRoute} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Meals View with CRUD ─── */
function MealsView({ tripId, meals, loading, onUpdateStatus, onSelectEntity, isEditor, onCreate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ meal: '', day_id: 'thu', owner: '', status: 'Pending', note: '' })

  const days = [
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' },
    { value: 'sat', label: 'Sat' },
    { value: 'sun', label: 'Sun' },
  ]

  const openAdd = () => {
    setEditing(null)
    setForm({ meal: '', day_id: 'thu', owner: '', status: 'Pending', note: '' })
    setModalOpen(true)
  }

  const openEdit = (meal) => {
    setEditing(meal)
    setForm({
      meal: meal.meal || '',
      day_id: meal.day_id || 'thu',
      owner: meal.owner || '',
      status: meal.status || 'Pending',
      note: meal.note || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.meal.trim()) return
    try {
      if (editing) {
        await updateMeal(editing.id, form)
      } else {
        await onCreate({ ...form, trip_id: tripId })
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Failed to save meal:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Meal Plan" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading meals...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle eyebrow="Logistics" title="Meal Plan" meta={`${meals.length} meals`} />
        {isEditor && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1 border border-info bg-info-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-info transition-colors hover:bg-info/20"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No Meals" subtitle="Add meals to plan your trip logistics" />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="group flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 transition-colors hover:border-info/40 hover:bg-bg-panel"
            >
              <button
                onClick={() => onSelectEntity('meal', meal)}
                className="flex-1 text-left"
              >
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
              </button>
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
                {isEditor && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(meal)} className="p-1 text-text-secondary hover:text-info">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(meal.id)} className="p-1 text-text-secondary hover:text-critical">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <InlineModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Meal' : 'Add Meal'}>
        <div className="space-y-3">
          <FormField label="Meal">
            <TextInput value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value })} placeholder="e.g. Beach picnic" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Day">
              <SelectField value={form.day_id} onChange={(e) => setForm({ ...form, day_id: e.target.value })} options={days} />
            </FormField>
            <FormField label="Status">
              <SelectField
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Assigned', label: 'Assigned' },
                  { value: 'Settled', label: 'Settled' },
                ]}
              />
            </FormField>
          </div>
          <FormField label="Owner">
            <TextInput value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="e.g. Sydney Crew" />
          </FormField>
          <FormField label="Note">
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Optional note..."
              rows={3}
              className="w-full resize-none border border-border-default bg-bg-base px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.meal.trim()}
              className={cn(
                'border px-4 py-2 text-[11px] font-black uppercase tracking-wider',
                form.meal.trim() ? 'border-success bg-success-soft text-success hover:bg-success/20' : 'cursor-not-allowed border-border-default bg-bg-panel text-text-muted'
              )}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </InlineModal>
    </div>
  )
}

/* ─── Tasks View with CRUD ─── */
function TasksView({ tripId, tasks, loading, onToggleStatus, onSelectEntity, isEditor, onCreate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', day_id: 'thu', status: 'open', assigned_family_id: '' })

  const days = [
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' },
    { value: 'sat', label: 'Sat' },
    { value: 'sun', label: 'Sun' },
  ]

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', day_id: 'thu', status: 'open', assigned_family_id: '' })
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditing(task)
    setForm({
      title: task.title || '',
      day_id: task.day_id || 'thu',
      status: task.status || 'open',
      assigned_family_id: task.assigned_family_id || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    try {
      if (editing) {
        await updateTask(editing.id, form)
      } else {
        await onCreate({ ...form, trip_id: tripId })
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Failed to save task:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Operations" title="Task Board" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading tasks...</div>
      </div>
    )
  }

  const pending = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle eyebrow="Operations" title="Task Board" meta={`${pending.length} open · ${done.length} done`} />
        {isEditor && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1 border border-info bg-info-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-info transition-colors hover:bg-info/20"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No Tasks" subtitle="Add tasks to track operations" />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center justify-between border border-border-default bg-bg-surface px-4 py-3 transition-colors hover:border-info/40 hover:bg-bg-panel"
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
                <button onClick={() => onSelectEntity('task', task)} className="text-left">
                  <div className={cn(
                    'text-[12px] font-bold',
                    task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'
                  )}>
                    {task.title}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                    {task.day_id?.toUpperCase()} · {task.assigned_family_id ? 'Assigned' : 'Unassigned'}
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={task.status === 'done' ? 'done' : 'open'}>
                  {task.status === 'done' ? 'Done' : 'Open'}
                </StatusPill>
                {isEditor && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(task)} className="p-1 text-text-secondary hover:text-info">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1 text-text-secondary hover:text-critical">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <InlineModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <div className="space-y-3">
          <FormField label="Title">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Pack BBQ kit" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Day">
              <SelectField value={form.day_id} onChange={(e) => setForm({ ...form, day_id: e.target.value })} options={days} />
            </FormField>
            <FormField label="Status">
              <SelectField
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'done', label: 'Done' },
                  { value: 'blocked', label: 'Blocked' },
                ]}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className={cn(
                'border px-4 py-2 text-[11px] font-black uppercase tracking-wider',
                form.title.trim() ? 'border-success bg-success-soft text-success hover:bg-success/20' : 'cursor-not-allowed border-border-default bg-bg-panel text-text-muted'
              )}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </InlineModal>
    </div>
  )
}

/* ─── Expenses View with CRUD ─── */
function ExpensesView({ tripId, expenses, loading, onSelectEntity, isEditor, onCreate, onDelete, onToggleSettled, families }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', amount: '', payer_family_id: '', allocation_mode: 'equal' })

  const familyName = (id) => families.find((f) => f.id === id)?.name || '—'

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', amount: '', payer_family_id: '', allocation_mode: 'equal' })
    setModalOpen(true)
  }

  const openEdit = (expense) => {
    setEditing(expense)
    setForm({
      title: expense.title || '',
      amount: String(expense.amount || ''),
      payer_family_id: expense.payer_family_id || '',
      allocation_mode: expense.allocation_mode || 'equal',
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.amount) return
    try {
      const payload = { ...form, amount: parseFloat(form.amount), trip_id: tripId }
      if (editing) {
        await updateExpense(editing.id, payload)
      } else {
        await onCreate(payload)
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Failed to save expense:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Logistics" title="Expenses" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading expenses...</div>
      </div>
    )
  }

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const unsettled = expenses.filter((e) => !e.settled)

  // Settle-up: compute net balance per family (equal split only for now)
  const settleUp = families.length > 1 ? (() => {
    const n = families.length
    const paid = {}   // how much each family has paid
    const owes = {}   // how much each family owes in total
    families.forEach((f) => { paid[f.id] = 0; owes[f.id] = 0 })
    unsettled.forEach((e) => {
      if (e.payer_family_id && paid[e.payer_family_id] !== undefined) {
        paid[e.payer_family_id] += e.amount || 0
      }
      const share = (e.amount || 0) / n
      families.forEach((f) => { owes[f.id] += share })
    })
    return families.map((f) => ({
      id: f.id,
      name: f.name,
      net: paid[f.id] - owes[f.id], // positive = others owe them
    }))
  })() : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle eyebrow="Logistics" title="Expenses" meta={`$${total.toFixed(0)} total`} />
        {isEditor && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1 border border-info bg-info-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-info transition-colors hover:bg-info/20"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {/* Settle-up panel */}
      {settleUp.length > 0 && unsettled.length > 0 && (
        <div className="mt-4 border border-border-default bg-bg-surface">
          <div className="border-b border-border-default bg-bg-panel px-4 py-2">
            <div className="text-[9px] font-black uppercase tracking-wider text-warning">Settle Up</div>
          </div>
          <div className="grid divide-y divide-border-default">
            {settleUp.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-2">
                <div className="text-[11px] font-bold text-text-primary">{f.name}</div>
                <div className={`text-[12px] font-black font-mono ${f.net > 0.01 ? 'text-success' : f.net < -0.01 ? 'text-critical' : 'text-text-muted'}`}>
                  {f.net > 0.01 ? `+$${f.net.toFixed(2)} owed to them` : f.net < -0.01 ? `-$${Math.abs(f.net).toFixed(2)} they owe` : 'Even'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No Expenses" subtitle="Add expenses to track shared costs" />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className={cn(
                'group flex items-center justify-between border px-4 py-3 transition-colors',
                expense.settled
                  ? 'border-border-default bg-bg-panel opacity-60'
                  : 'border-border-default bg-bg-surface hover:border-info/40 hover:bg-bg-panel'
              )}
            >
              <button onClick={() => onSelectEntity('expense', expense)} className="flex-1 text-left">
                <div className={cn('text-[13px] font-bold', expense.settled ? 'line-through text-text-muted' : 'text-text-primary')}>
                  {expense.title}
                </div>
                <div className="text-[10px] text-text-secondary">
                  Paid by {familyName(expense.payer_family_id)} · {expense.allocation_mode === 'equal' ? 'Equal split' : expense.allocation_mode}
                </div>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-[14px] font-black font-mono text-text-primary">
                  ${expense.amount?.toFixed(2)}
                </div>
                {onToggleSettled && (
                  <button
                    onClick={() => onToggleSettled(expense.id, !expense.settled)}
                    className={cn(
                      'border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors',
                      expense.settled
                        ? 'border-success bg-success-soft text-success hover:bg-success/20'
                        : 'border-border-default bg-bg-panel text-text-muted hover:border-success hover:text-success'
                    )}
                  >
                    {expense.settled ? 'Settled' : 'Settle'}
                  </button>
                )}
                {isEditor && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(expense)} className="p-1 text-text-secondary hover:text-info">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(expense.id)} className="p-1 text-text-secondary hover:text-critical">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <InlineModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-3">
          <FormField label="Title">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Accommodation" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount ($)">
              <TextInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </FormField>
            <FormField label="Payer">
              <SelectField
                value={form.payer_family_id}
                onChange={(e) => setForm({ ...form, payer_family_id: e.target.value })}
                placeholder="Select payer"
                options={families.map((f) => ({ value: f.id, label: f.name }))}
              />
            </FormField>
          </div>
          <FormField label="Split">
            <SelectField
              value={form.allocation_mode}
              onChange={(e) => setForm({ ...form, allocation_mode: e.target.value })}
              options={[
                { value: 'equal', label: 'Equal split' },
                { value: 'manual', label: 'Manual split' },
                { value: 'individual', label: 'Individual' },
              ]}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim() || !form.amount}
              className={cn(
                'border px-4 py-2 text-[11px] font-black uppercase tracking-wider',
                form.title.trim() && form.amount ? 'border-success bg-success-soft text-success hover:bg-success/20' : 'cursor-not-allowed border-border-default bg-bg-panel text-text-muted'
              )}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </InlineModal>
    </div>
  )
}

/* ─── Itinerary View with CRUD ─── */
function ItineraryView({
  tripId, items, loading, isEditor, onRefresh, tripMeta,
  cursorSlot, isPlaying, playbackSpeed,
  onTogglePlayback, onRestartPlayback, onSetPlaybackSpeed, onSetCursor, onOpenBriefing,
  onSelectEntity,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', day_id: 'thu', row_id: 'activities', start_slot: '0', span: '1', color: 'info', linked_entities: [] })

  const days = [
    { value: 'thu', label: 'Thu 4/09' },
    { value: 'fri', label: 'Fri 4/10' },
    { value: 'sat', label: 'Sat 4/11' },
    { value: 'sun', label: 'Sun 4/12' },
  ]

  const slots = [
    { value: '0', label: '00:00' },
    { value: '6', label: '06:00' },
    { value: '12', label: '12:00' },
    { value: '18', label: '18:00' },
  ]

  const colors = [
    { value: 'info', label: 'Blue' },
    { value: 'success', label: 'Green' },
    { value: 'warning', label: 'Amber' },
    { value: 'critical', label: 'Red' },
  ]

  const rows = [
    { value: 'travel', label: 'Travel' },
    { value: 'activities', label: 'Activities' },
    { value: 'support', label: 'Support' },
  ]

  const LANES = [
    { id: 'travel', label: 'Travel' },
    { id: 'activities', label: 'Activities' },
    { id: 'support', label: 'Support' },
  ]

  const colorClasses = {
    info: 'border-info/40 bg-info-soft text-info',
    success: 'border-success/40 bg-success-soft text-success',
    warning: 'border-warning/40 bg-warning-soft text-warning',
    critical: 'border-critical/40 bg-critical-soft text-critical',
  }

  const openAdd = (dayId, laneId, slotValue) => {
    setEditing(null)
    setForm({
      title: '',
      day_id: dayId,
      row_id: laneId,
      start_slot: String(slotValue),
      span: '1',
      color: 'info',
      linked_entities: [],
    })
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      day_id: item.day_id || 'thu',
      row_id: item.row_id || 'activities',
      start_slot: String(item.start_slot || 0),
      span: String(item.span || 1),
      color: item.color || 'info',
      linked_entities: item.linked_entities || [],
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    try {
      const payload = {
        ...form,
        start_slot: parseFloat(form.start_slot),
        span: parseFloat(form.span),
        trip_id: tripId,
      }
      if (editing) {
        await updateItineraryItem(editing.id, payload)
      } else {
        await createItineraryItem(payload)
      }
      onRefresh()
      setModalOpen(false)
    } catch (err) {
      console.error('Failed to save itinerary item:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteItineraryItem(id)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete itinerary item:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SectionTitle eyebrow="Timeline" title="Mission Timeline" />
        <div className="mt-4 text-[11px] text-text-secondary">Loading timeline...</div>
      </div>
    )
  }

  // Group items: day_id → lane_id → items[]
  const byDayLane = {}
  DAYS.forEach((d) => {
    byDayLane[d.id] = { travel: [], activities: [], support: [] }
  })
  items.forEach((item) => {
    const dayGroup = byDayLane[item.day_id]
    if (dayGroup && item.row_id in dayGroup) {
      dayGroup[item.row_id].push(item)
    }
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle eyebrow="Timeline" title="Mission Timeline" meta={`${DAYS.length} days · 6-hour slots`} />
        {isEditor && (
          <button
            onClick={() => openAdd('thu', 'activities', 0)}
            className="flex items-center gap-1 border border-info bg-info-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-info transition-colors hover:bg-info/20"
          >
            <Plus size={12} /> Add Item
          </button>
        )}
      </div>

      {/* Weather Widget */}
      <div className="mb-6">
        <WeatherWidget
          lat={tripMeta?.basecampCoordinates?.lat ?? -35.1333}
          lng={tripMeta?.basecampCoordinates?.lng ?? 150.7000}
          locationName={tripMeta?.basecampAddress || 'Basecamp'}
        />
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.id} className="border border-border-default bg-bg-surface">
            {/* Day header */}
            <div className="flex items-center justify-between border-b border-border-default bg-bg-panel px-4 py-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-info">{day.shortLabel}</span>
                <span className="text-[12px] font-bold text-text-primary">{day.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-secondary">{day.weather} · {day.temperature}</span>
                <button
                  onClick={() => onOpenBriefing?.(day.id)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-text-muted hover:text-info transition-colors"
                >
                  <FileText size={10} /> Briefing
                </button>
                {isEditor && (
                  <button
                    onClick={() => openAdd(day.id, 'activities', 0)}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-text-muted hover:text-info transition-colors"
                  >
                    <Plus size={10} /> Add
                  </button>
                )}
              </div>
            </div>

            {/* Gantt grid */}
            <div className="overflow-x-auto relative">
              {/* Cursor line (day-level) */}
              {(() => {
                const dayIndex = DAYS.findIndex((d) => d.id === day.id)
                const dayStart = dayIndex * TIME_SLOTS.length
                const dayEnd = dayStart + TIME_SLOTS.length
                if (cursorSlot >= dayStart - 0.01 && cursorSlot <= dayEnd + 0.01) {
                  const dayCursor = cursorSlot - dayStart
                  const hour = dayCursor * 6
                  const leftPct = (hour / 24) * 100
                  return (
                    <div
                      className="absolute top-0 bottom-0 z-20 pointer-events-none"
                      style={{ left: `calc(80px + ${leftPct}%)`, width: '1px', background: 'rgba(88,166,255,0.6)', boxShadow: '0 0 6px rgba(88,166,255,0.4)' }}
                    />
                  )
                }
                return null
              })()}

              {/* Time axis header */}
              <div className="flex border-b border-border-default/60 bg-bg-panel" style={{ paddingLeft: '80px' }}>
                {[0, 6, 12, 18].map((slot) => (
                  <div
                    key={slot}
                    className="flex-1 border-l border-border-default/40 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-text-muted"
                  >
                    {String(slot).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Lane rows */}
              {LANES.map((lane, laneIdx) => {
                const laneItems = byDayLane[day.id]?.[lane.id] || []
                return (
                  <div
                    key={lane.id}
                    className={cn('flex min-h-[48px]', laneIdx > 0 && 'border-t border-border-default/40')}
                  >
                    {/* Lane label */}
                    <div className="w-[80px] flex-shrink-0 flex items-center px-2 bg-bg-panel border-r border-border-default">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary">{lane.label}</span>
                    </div>

                    {/* Item canvas */}
                    <div className="flex-1 relative py-1">
                      {/* Slot dividers */}
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-border-default/30 pointer-events-none"
                          style={{ left: `${i * 25}%` }}
                        />
                      ))}

                      {/* Click zones */}
                      {isEditor && (
                        <div className="absolute inset-0 flex">
                          {[0, 6, 12, 18].map((slot) => (
                            <div
                              key={slot}
                              className="flex-1 hover:bg-info-soft/5 cursor-pointer transition-colors"
                              onClick={() => openAdd(day.id, lane.id, slot)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Items */}
                      {laneItems.map((item) => {
                        const leftPct = (item.start_slot / 24) * 100
                        const widthPct = ((item.span || 1) * 6 / 24) * 100
                        const clampedWidth = Math.min(widthPct, 100 - leftPct)
                        const itemStartSlotGlobal = DAYS.findIndex((d) => d.id === day.id) * TIME_SLOTS.length + item.start_slot / 6
                        const itemEndSlotGlobal = itemStartSlotGlobal + (item.span || 1)
                        const isPast = cursorSlot > itemEndSlotGlobal
                        const isCurrent = cursorSlot >= itemStartSlotGlobal && cursorSlot <= itemEndSlotGlobal
                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectEntity?.('itinerary_item', item)}
                            className={cn(
                              'absolute top-1.5 bottom-1.5 border px-2 flex items-center gap-1 text-[10px] font-bold overflow-hidden group cursor-pointer z-10 transition-opacity',
                              colorClasses[item.color] || colorClasses.info,
                              isPast && !isCurrent && 'opacity-40',
                              isCurrent && 'ring-1 ring-info/50'
                            )}
                            style={{ left: `${leftPct}%`, width: `calc(${clampedWidth}% - 2px)` }}
                          >
                            <span className="truncate leading-none">{item.title}</span>
                            {(item.span || 1) > 1 && (
                              <span className="flex-shrink-0 text-[8px] opacity-60">{(item.span || 1) * 6}h</span>
                            )}
                            {isCurrent && isPlaying && (
                              <span className="flex-shrink-0 ml-auto h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
                            )}
                            {isEditor && (
                              <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(item) }}
                                  className="p-0.5 hover:opacity-80"
                                >
                                  <Pencil size={9} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                  className="p-0.5 hover:opacity-80"
                                >
                                  <Trash2 size={9} />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <PlaybackBar
        cursorSlot={cursorSlot}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTogglePlayback={onTogglePlayback}
        onRestartPlayback={onRestartPlayback}
        onSetPlaybackSpeed={onSetPlaybackSpeed}
        onSetCursor={onSetCursor}
      />

      <InlineModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Itinerary Item'}>
        <div className="space-y-3">
          <FormField label="Title">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Depart Sydney" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Day">
              <SelectField value={form.day_id} onChange={(e) => setForm({ ...form, day_id: e.target.value })} options={days} />
            </FormField>
            <FormField label="Row">
              <SelectField value={form.row_id} onChange={(e) => setForm({ ...form, row_id: e.target.value })} options={rows} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Start Slot">
              <SelectField value={form.start_slot} onChange={(e) => setForm({ ...form, start_slot: e.target.value })} options={slots} />
            </FormField>
            <FormField label="Span (slots)">
              <SelectField
                value={form.span}
                onChange={(e) => setForm({ ...form, span: e.target.value })}
                options={[
                  { value: '1', label: '1 slot (6h)' },
                  { value: '2', label: '2 slots (12h)' },
                  { value: '3', label: '3 slots (18h)' },
                  { value: '4', label: '4 slots (24h)' },
                ]}
              />
            </FormField>
            <FormField label="Color">
              <SelectField value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} options={colors} />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="border border-border-default bg-bg-panel px-4 py-2 text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className={cn(
                'border px-4 py-2 text-[11px] font-black uppercase tracking-wider',
                form.title.trim() ? 'border-success bg-success-soft text-success hover:bg-success/20' : 'cursor-not-allowed border-border-default bg-bg-panel text-text-muted'
              )}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </InlineModal>
    </div>
  )
}

/* ─── Main Dashboard ─── */
export function Dashboard() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const [activePage, setActivePage] = useState('families')
  const [activeFamily, setActiveFamily] = useState('sydney-crew')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntity, setSelectedEntity] = useState(null)

  // ── Data loading (must be before any effects that reference them) ──
  const { trip } = useTrip(tripId)
  const { isEditor, role } = useTripPermission(tripId)
  const { members, loading: membersLoading } = useTripMembers(tripId)
  const { families, loading: familiesLoading, toggleChecklist, updateReadiness } = useFamilies(tripId)
  const { meals, loading: mealsLoading, updateStatus: updateMealStatus, refresh: refreshMeals } = useMeals(tripId)
  const { tasks, loading: tasksLoading, toggleStatus: toggleTaskStatus, refresh: refreshTasks } = useTasks(tripId)
  const { expenses, loading: expensesLoading, refresh: refreshExpenses } = useExpenses(tripId)
  const { locations } = useLocations(tripId)
  const { routes } = useRoutes(tripId)
  const directionsByRoute = useAllDirections(routes)
  const { items: itineraryItems, loading: itineraryLoading, refresh: refreshItinerary } = useItineraryItems(tripId)

  const operationCheckpoints = useMemo(
    () => buildOperationCheckpoints(itineraryItems),
    [itineraryItems]
  )

  // ── Timeline playback state ──
  const [cursorSlot, setCursorSlot] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [operationGate, setOperationGate] = useState(null)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [briefingDayId, setBriefingDayId] = useState(null)
  const playbackCursorRef = useRef(0)
  const playbackRunRef = useRef({ anchorCursor: 0, anchorTimestamp: null })
  const triggeredCheckpointIdsRef = useRef(new Set())

  // rAF playback loop
  useEffect(() => {
    if (!isPlaying) return

    let frameId = null
    const maxCursor = clampTimelineCursor(DAYS.length * TIME_SLOTS.length)
    playbackRunRef.current = { anchorCursor: playbackCursorRef.current, anchorTimestamp: null }

    const animate = (timestamp) => {
      if (operationGate) {
        playbackRunRef.current.anchorTimestamp = timestamp
        frameId = requestAnimationFrame(animate)
        return
      }

      const previousTimestamp = playbackRunRef.current.anchorTimestamp
      playbackRunRef.current.anchorTimestamp = timestamp

      if (previousTimestamp == null) {
        frameId = requestAnimationFrame(animate)
        return
      }

      const rawDelta = Math.max((timestamp - previousTimestamp) / 1000, 0)
      const deltaSeconds = rawDelta > PLAYBACK_STALL_RESET_SECONDS
        ? 0
        : Math.min(rawDelta, PLAYBACK_MAX_FRAME_DELTA_SECONDS)
      const currentCursor = playbackCursorRef.current
      const nextCursor = clampTimelineCursor(
        currentCursor + deltaSeconds * PLAYBACK_SLOT_UNITS_PER_SECOND * playbackSpeed
      )

      const crossed = findCrossedCheckpoint(
        operationCheckpoints, currentCursor, nextCursor, triggeredCheckpointIdsRef.current
      )

      if (crossed) {
        triggeredCheckpointIdsRef.current.add(crossed.id)
        playbackCursorRef.current = crossed.startSlot
        setCursorSlot(crossed.startSlot)
        setOperationGate(crossed)
        playbackRunRef.current.anchorTimestamp = timestamp
        frameId = requestAnimationFrame(animate)
        return
      }

      playbackCursorRef.current = nextCursor
      setCursorSlot(nextCursor)

      if (nextCursor >= maxCursor - 0.002) {
        setIsPlaying(false)
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => { if (frameId) cancelAnimationFrame(frameId) }
  }, [isPlaying, operationCheckpoints, playbackSpeed, operationGate])

  const handleTogglePlayback = useCallback(() => {
    if (isPlaying) {
      const committed = clampTimelineCursor(playbackCursorRef.current)
      setIsPlaying(false)
      setCursorSlot(committed)
      playbackCursorRef.current = committed
      return
    }
    const start = getSuggestedPlaybackStart(cursorSlot, operationCheckpoints)
    triggeredCheckpointIdsRef.current = new Set(
      operationCheckpoints.filter((cp) => cp.startSlot <= start + 0.001).map((cp) => cp.id)
    )
    playbackRunRef.current = { anchorCursor: start, anchorTimestamp: null }
    playbackCursorRef.current = start
    setCursorSlot(start)
    setIsPlaying(true)
  }, [isPlaying, cursorSlot, operationCheckpoints])

  const handleRestartPlayback = useCallback(() => {
    setIsPlaying(false)
    setOperationGate(null)
    triggeredCheckpointIdsRef.current = new Set()
    playbackCursorRef.current = 0
    setCursorSlot(0)
  }, [])

  const handleSetCursor = useCallback((slot) => {
    const next = clampTimelineCursor(slot)
    setOperationGate(null)
    triggeredCheckpointIdsRef.current = new Set(
      operationCheckpoints.filter((cp) => cp.startSlot <= next + 0.001).map((cp) => cp.id)
    )
    playbackCursorRef.current = next
    setCursorSlot(next)
    if (isPlaying) {
      playbackRunRef.current = { anchorCursor: next, anchorTimestamp: null }
    }
  }, [operationCheckpoints, isPlaying])

  const handleProceedGate = useCallback(() => {
    setOperationGate(null)
  }, [])

  const handleAbortGate = useCallback(() => {
    const committed = clampTimelineCursor(playbackCursorRef.current)
    setIsPlaying(false)
    setOperationGate(null)
    setCursorSlot(committed)
    playbackCursorRef.current = committed
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

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
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  // CRUD handlers
  const handleCreateMeal = async (meal) => {
    await createMeal(meal)
    refreshMeals()
  }
  const handleDeleteMeal = async (id) => {
    if (!confirm('Delete this meal?')) return
    await deleteMeal(id)
    refreshMeals()
  }

  const handleCreateTask = async (task) => {
    await createTask(task)
    refreshTasks()
  }
  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await deleteTask(id)
    refreshTasks()
  }

  const handleCreateExpense = async (expense) => {
    await createExpense(expense)
    refreshExpenses()
  }
  const handleDeleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return
    await deleteExpense(id)
    refreshExpenses()
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
            routes={routes}
            directionsByRoute={directionsByRoute}
          />
        )
      case 'meals':
        return (
          <MealsView
            tripId={tripId}
            meals={meals}
            loading={mealsLoading}
            onUpdateStatus={updateMealStatus}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
            onCreate={handleCreateMeal}
            onDelete={handleDeleteMeal}
          />
        )
      case 'itinerary':
        return (
          <ItineraryView
            tripId={tripId}
            items={itineraryItems}
            loading={itineraryLoading}
            isEditor={isEditor}
            families={families}
            onRefresh={refreshItinerary}
            cursorSlot={cursorSlot}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onTogglePlayback={handleTogglePlayback}
            onRestartPlayback={handleRestartPlayback}
            onSetPlaybackSpeed={setPlaybackSpeed}
            onSetCursor={handleSetCursor}
            onOpenBriefing={(dayId) => { setBriefingDayId(dayId); setBriefingOpen(true) }}
            onSelectEntity={handleSelectEntity}

          />
        )
      case 'situation':
        return (
          <SituationView
            tripMeta={tripMeta}
            families={families}
            locations={locations}
            routes={routes}
            directionsByRoute={directionsByRoute}
            cursorSlot={cursorSlot}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onTogglePlayback={handleTogglePlayback}
            onRestartPlayback={handleRestartPlayback}
            onSetPlaybackSpeed={setPlaybackSpeed}
            onSetCursor={handleSetCursor}
          />
        )
      case 'tasks':
        return (
          <TasksView
            tripId={tripId}
            tasks={tasks}
            loading={tasksLoading}
            onToggleStatus={toggleTaskStatus}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
            onCreate={handleCreateTask}
            onDelete={handleDeleteTask}
          />
        )
      case 'expenses':
        return (
          <ExpensesView
            tripId={tripId}
            expenses={expenses}
            loading={expensesLoading}
            onSelectEntity={handleSelectEntity}
            isEditor={isEditor}
            onCreate={handleCreateExpense}
            onDelete={handleDeleteExpense}
            onToggleSettled={handleToggleExpenseSettled}
            families={families}
          />
        )
      case 'activities':
      case 'stay':
        return (
          <ItineraryView
            tripId={tripId}
            items={itineraryItems}
            loading={itineraryLoading}
            isEditor={isEditor}
            families={families}
            onRefresh={refreshItinerary}
          />
        )
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
            onSelectEntity={handleSelectEntity}
            tripId={tripId}
            families={families}
            meals={meals}
            tasks={tasks}
            expenses={expenses}
            locations={locations}
            routes={routes}
            directionsByRoute={directionsByRoute}
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

      {/* Modals */}
      {briefingOpen && (
        <DailyBriefingModal
          dayId={briefingDayId}
          items={itineraryItems}
          meals={meals}
          tasks={tasks}
          onClose={() => setBriefingOpen(false)}
          onSelectEntity={(type, data) => {
            setSelectedEntity({ type, ...data })
            setBriefingOpen(false)
          }}
        />
      )}

      <MissionLaunchModal
        gate={operationGate}
        onProceed={handleProceedGate}
        onAbort={handleAbortGate}
      />
    </div>
  )
}
