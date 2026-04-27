import { useMemo, useState, useEffect } from 'react'
import {
  Check,
  CheckSquare,
  ExternalLink,
  MapPin,
  Receipt,
  Square,
  X,
} from 'lucide-react'
import { StatusPill } from './ui/StatusPill'
import { cn } from '../lib/utils'
import { formatDuration, formatDistance } from '../lib/directions'

function SectionTitle({ eyebrow, title, meta }) {
  return (
    <div className="mb-3">
      {eyebrow ? (
        <div className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-info">
          {eyebrow}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-text-primary">
          {title}
        </h3>
        {meta ? <div className="text-[10px] font-bold text-text-secondary">{meta}</div> : null}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-default/30 py-2 text-[11px] last:border-b-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-right text-text-primary">{value}</span>
    </div>
  )
}

function ActionChip({ icon: Icon, label, onClick, tone = 'default' }) {
  const tones = {
    default: 'border-border-default bg-bg-surface text-text-primary hover:border-info/40 hover:text-info',
    success: 'border-success/30 bg-success-soft text-success hover:border-success',
    warning: 'border-warning/30 bg-warning-soft text-warning hover:border-warning',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${tones[tone] || tones.default}`}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}

function TaskRow({ task, onToggle, families }) {
  const done = task.status === 'done'
  const assignedFamily = families?.find((f) => f.id === task.assigned_family_id)

  return (
    <button
      type="button"
      onClick={() => onToggle(task.id, task.status)}
      className="flex w-full items-center justify-between border-b border-border-default/30 px-3 py-3 text-left text-[11px] text-text-primary transition-colors last:border-b-0 hover:bg-bg-panel/50"
    >
      <div>
        <div className="font-medium">{task.title}</div>
        <div className="text-[10px] text-text-secondary">
          {task.day_id?.toUpperCase()}
          {assignedFamily ? ` · ${assignedFamily.name}` : ''}
        </div>
      </div>
      <span
        className={`flex h-5 w-5 items-center justify-center border ${
          done ? 'border-success bg-success-soft text-success' : 'border-border-default text-text-secondary'
        }`}
      >
        {done ? <Check size={12} /> : null}
      </span>
    </button>
  )
}

function MembersPanel({ members, membersLoading, isEditor, role }) {
  return (
    <div className="p-4">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-info mb-3">
        Trip Members
      </div>

      {/* My permission badge */}
      <div className="mb-4 border border-border-default bg-bg-panel p-3">
        <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-1">
          Your Access
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone={isEditor ? 'success' : 'info'}>
            {isEditor ? 'Editor' : 'Viewer'}
          </StatusPill>
          {role === 'organizer' && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-warning">
              Organizer
            </span>
          )}
        </div>
        {!isEditor && (
          <div className="mt-2 text-[10px] text-text-secondary">
            View-only access. Contact the trip organizer to make changes.
          </div>
        )}
      </div>

      {/* Members list */}
      <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary mb-2">
        Joined ({members.length})
      </div>
      {membersLoading ? (
        <div className="text-[11px] text-text-muted">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-[11px] text-text-muted">No members yet</div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 border border-border-default bg-bg-panel p-2"
            >
              <div className="h-7 w-7 flex-shrink-0 overflow-hidden border border-border-default bg-bg-base">
                {member.user?.avatar_url ? (
                  <img
                    src={member.user.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-text-secondary">
                    {(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-text-primary">
                  {member.user?.name || member.user?.email || 'Unknown'}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-text-secondary">
                    {member.role === 'organizer' ? 'Organizer' : 'Member'}
                  </span>
                  <span className="text-[9px] text-text-muted">·</span>
                  <span className={cn(
                    'text-[9px] font-bold uppercase',
                    member.permission === 'editor' ? 'text-success' : 'text-info'
                  )}>
                    {member.permission}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function InspectorRail({
  selectedEntity,
  onClearSelection,
  onSelectEntity,
  tripId,
  families,
  meals,
  tasks,
  expenses,
  locations,
  routes,
  directionsByRoute,
  members,
  membersLoading,
  isEditor,
  role,
  onToggleMealStatus,
  onToggleTaskStatus,
  onToggleExpenseSettled,
  onAddTask,
  onUpdateEntityNote,
}) {
  const [quickTask, setQuickTask] = useState('')
  const [recentlyUpdated, setRecentlyUpdated] = useState(false)

  const entity = selectedEntity

  // Flash animation when selection changes
  useEffect(() => {
    if (!entity) return
    const raf = requestAnimationFrame(() => setRecentlyUpdated(true))
    const timerId = window.setTimeout(() => setRecentlyUpdated(false), 700)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timerId)
    }
  }, [entity])

  // Resolve related data based on entity type
  const relatedTasks = useMemo(() => {
    if (!entity) return []
    switch (entity.type) {
      case 'family':
        return tasks.filter((t) => t.assigned_family_id === entity.id)
      case 'meal':
      case 'expense':
      case 'location':
        // For now, tasks aren't linked to these entities in our schema
        return []
      default:
        return []
    }
  }, [entity, tasks])

  const relatedExpenses = useMemo(() => {
    if (entity?.type !== 'family') return []
    return expenses.filter((e) => e.payer_family_id === entity.id)
  }, [entity, expenses])

  const linkedLocation = useMemo(() => {
    if (entity?.type !== 'meal' || !entity.location_id) return null
    return locations.find((l) => l.id === entity.location_id)
  }, [entity, locations])

  const payerFamily = useMemo(() => {
    if (entity?.type !== 'expense' || !entity.payer_family_id) return null
    return families.find((f) => f.id === entity.payer_family_id)
  }, [entity, families])

  const assignedFamily = useMemo(() => {
    if (entity?.type !== 'task' || !entity.assigned_family_id) return null
    return families.find((f) => f.id === entity.assigned_family_id)
  }, [entity, families])

  // Resolve family route + directions
  const familyRoute = useMemo(() => {
    if (entity?.type !== 'family') return null
    return routes?.find((r) => r.familyId === entity.id || r.family_id === entity.id)
  }, [entity, routes])

  const familyDirections = useMemo(() => {
    if (!familyRoute) return null
    return directionsByRoute?.[familyRoute.id]
  }, [familyRoute, directionsByRoute])

  // Resolve linked entities for itinerary items
  const resolvedLinkedEntities = useMemo(() => {
    if (entity?.type !== 'itinerary_item' || !entity.linked_entities?.length) return []
    return entity.linked_entities.map((le) => {
      let resolved = null
      switch (le.type) {
        case 'location':
          resolved = locations?.find((l) => l.id === le.id)
          break
        case 'meal':
          resolved = meals?.find((m) => m.id === le.id)
          break
        case 'route':
          resolved = routes?.find((r) => r.id === le.id)
          break
        case 'task':
          resolved = tasks?.find((t) => t.id === le.id)
          break
        case 'expense':
          resolved = expenses?.find((e) => e.id === le.id)
          break
        case 'family':
          resolved = families?.find((f) => f.id === le.id)
          break
      }
      return { ...le, resolved, name: resolved?.title || resolved?.meal || resolved?.name || le.id }
    }).filter((le) => le.resolved)
  }, [entity, locations, meals, routes, tasks, expenses, families])

  // Default view: Members panel
  if (!entity) {
    return (
      <aside className="hidden w-80 flex-col border-l border-border-default bg-bg-surface xl:flex">
        <div className="border-b border-border-default bg-bg-panel p-4">
          <div className="text-[12px] font-black uppercase tracking-[0.14em] text-text-primary">
            Inspector
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MembersPanel
            members={members}
            membersLoading={membersLoading}
            isEditor={isEditor}
            role={role}
          />
        </div>
      </aside>
    )
  }

  // Build action chips
  const actionChips = []

  if (entity.type === 'meal') {
    actionChips.push({
      icon: CheckSquare,
      label: entity.status === 'Assigned' ? 'Mark pending' : 'Mark assigned',
      onClick: () => onToggleMealStatus(entity.id, entity.status),
      tone: entity.status === 'Assigned' ? 'warning' : 'success',
    })
  }

  if (entity.type === 'expense') {
    actionChips.push({
      icon: Receipt,
      label: entity.settled ? 'Mark open' : 'Mark settled',
      onClick: () => onToggleExpenseSettled(entity.id, !entity.settled),
      tone: entity.settled ? 'warning' : 'success',
    })
  }

  if (entity.type === 'task') {
    actionChips.push({
      icon: entity.status === 'done' ? Square : CheckSquare,
      label: entity.status === 'done' ? 'Mark open' : 'Mark done',
      onClick: () => onToggleTaskStatus(entity.id, entity.status),
      tone: entity.status === 'done' ? 'warning' : 'success',
    })
  }

  if (linkedLocation) {
    actionChips.push({
      icon: MapPin,
      label: 'Inspect location',
      onClick: () => onSelectEntity?.('location', linkedLocation),
    })
  }

  // Build detail rows based on entity type
  const detailRows = []
  if (entity.type === 'family') {
    if (entity.origin) detailRows.push(['Origin', entity.origin])
    if (entity.eta) detailRows.push(['ETA', entity.eta])
    if (entity.drive_time || entity.driveTime) detailRows.push(['Drive time', entity.drive_time || entity.driveTime])
    if (entity.vehicle) detailRows.push(['Vehicle', entity.vehicle])
    if (entity.headcount) detailRows.push(['Headcount', entity.headcount])
    if (entity.responsibility) detailRows.push(['Responsibility', entity.responsibility])
    detailRows.push(['Readiness', `${entity.readiness || 0}%`])
  } else if (entity.type === 'meal') {
    if (entity.day_id) detailRows.push(['Day', entity.day_id.toUpperCase()])
    if (entity.owner) detailRows.push(['Owner', entity.owner])
    if (linkedLocation) detailRows.push(['Location', linkedLocation.title])
  } else if (entity.type === 'task') {
    if (entity.day_id) detailRows.push(['Day', entity.day_id.toUpperCase()])
    if (assignedFamily) detailRows.push(['Assigned to', assignedFamily.name])
  } else if (entity.type === 'expense') {
    if (entity.amount !== null && entity.amount !== undefined) detailRows.push(['Amount', `$${Number(entity.amount).toFixed(2)}`])
    if (payerFamily) detailRows.push(['Payer', payerFamily.name])
    if (entity.allocation_mode) detailRows.push(['Split', entity.allocation_mode])
  } else if (entity.type === 'location') {
    if (entity.day_id && entity.day_id !== 'all') detailRows.push(['Day', entity.day_id.toUpperCase()])
    if (entity.category) detailRows.push(['Category', entity.category.charAt(0).toUpperCase() + entity.category.slice(1)])
    if (entity.address) detailRows.push(['Address', entity.address])
  } else if (entity.type === 'itinerary_item') {
    if (entity.day_id) detailRows.push(['Day', entity.day_id.toUpperCase()])
    if (entity.row_id) detailRows.push(['Lane', entity.row_id.charAt(0).toUpperCase() + entity.row_id.slice(1)])
    if (entity.start_slot !== undefined) detailRows.push(['Start', `${String(entity.start_slot).padStart(2, '0')}:00`])
    if (entity.span) detailRows.push(['Duration', `${(entity.span || 1) * 6}h`])
    const linkedFamilyNames = (entity.family_ids || []).map((fid) => families?.find((f) => f.id === fid)?.name).filter(Boolean)
    if (linkedFamilyNames.length) detailRows.push(['Units', linkedFamilyNames.join(', ')])
  }

  const taskCompletion = relatedTasks.length
    ? `${relatedTasks.filter((t) => t.status === 'done').length}/${relatedTasks.length}`
    : '0/0'

  return (
    <aside className="relative hidden w-80 flex-col overflow-hidden border-l border-border-default bg-bg-surface xl:flex">
      {/* Flash bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-info transition-all duration-500 ${
          recentlyUpdated ? 'opacity-100 shadow-[0_0_22px_rgba(88,166,255,0.55)]' : 'opacity-0'
        }`}
      />

      {/* Header */}
      <div
        className={`border-b border-border-default bg-bg-panel p-4 transition-[box-shadow,background-color,transform] duration-500 ${
          recentlyUpdated
            ? 'bg-bg-panel/80 shadow-[inset_0_0_0_1px_rgba(88,166,255,0.24),0_0_28px_rgba(88,166,255,0.08)]'
            : ''
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-info">
              {entity.type}
            </div>
            <h2 className="text-[15px] font-black uppercase tracking-[0.12em] text-text-primary">
              {entity.name || entity.meal || entity.title || 'Untitled'}
            </h2>
            <div className="mt-1 text-[11px] text-text-secondary">
              {entity.summary || entity.note || entity.description || ''}
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {'status' in entity && entity.status ? (
          <div className="mb-3">
            <StatusPill tone={entity.status}>{entity.status}</StatusPill>
          </div>
        ) : null}

        {actionChips.length ? (
          <div className="flex flex-wrap gap-2">
            {actionChips.map((action) => (
              <ActionChip
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                tone={action.tone}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Scrollable content */}
      <div
        className={`flex-1 space-y-4 overflow-y-auto p-4 transition-[transform,opacity] duration-300 ${
          recentlyUpdated ? 'translate-y-[1px]' : ''
        }`}
      >
        {/* Briefing / Context */}
        <section className="border border-border-default bg-bg-surface p-4">
          <SectionTitle eyebrow="Briefing" title="What matters here" />
          <div className="space-y-2 text-[11px] text-text-primary">
            {entity.note && <div className="leading-relaxed text-text-secondary">{entity.note}</div>}
            {entity.description && <div className="leading-relaxed text-text-secondary">{entity.description}</div>}
            {entity.summary && <div className="leading-relaxed text-text-secondary">{entity.summary}</div>}
            {!entity.note && !entity.description && !entity.summary && (
              <div className="text-text-secondary">No additional context.</div>
            )}
          </div>
          {detailRows.length > 0 && (
            <div className="mt-4 space-y-0 border-t border-border-default/50 pt-3">
              {detailRows.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </div>
          )}
        </section>

        {/* Linked entities for itinerary items */}
        {entity.type === 'itinerary_item' && (
          <section className="border border-border-default bg-bg-surface p-4">
            <SectionTitle
              eyebrow="Entity Graph"
              title="Linked Entities"
              meta={`${resolvedLinkedEntities.length}`}
            />
            {resolvedLinkedEntities.length > 0 ? (
              <div className="space-y-2">
                {resolvedLinkedEntities.map((le) => (
                  <button
                    key={`${le.type}-${le.id}`}
                    type="button"
                    onClick={() => onSelectEntity?.(le.type, le.resolved)}
                    className="flex w-full items-center justify-between border border-border-default bg-bg-panel px-3 py-2 text-left transition-colors hover:border-info/40 hover:bg-bg-elevated/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-info">{le.type}</span>
                      <span className="text-[11px] font-bold text-text-primary">{le.name}</span>
                    </div>
                    <ExternalLink size={12} className="text-text-secondary" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-text-secondary">
                No entities linked to this itinerary item. Edit the item to add links.
              </div>
            )}
          </section>
        )}

        {/* Linked location for meals */}
        {linkedLocation && (
          <section className="border border-border-default bg-bg-surface p-4">
            <SectionTitle eyebrow="Location Intel" title={linkedLocation.title} />
            <div className="space-y-2 text-[11px] text-text-primary">
              {linkedLocation.address && (
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="mt-0.5 text-info" />
                  <span>{linkedLocation.address}</span>
                </div>
              )}
              {linkedLocation.summary && (
                <div className="text-text-secondary">{linkedLocation.summary}</div>
              )}
              {linkedLocation.external_url && /^https?:\/\//.test(linkedLocation.external_url) && (
                <a
                  href={linkedLocation.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-info hover:underline"
                >
                  <ExternalLink size={11} />
                  Open external
                </a>
              )}
            </div>
          </section>
        )}

        {/* Drive plan for family */}
        {entity.type === 'family' && familyRoute && (
          <section className="border border-border-default bg-bg-surface p-4">
            <SectionTitle
              eyebrow="Route Intel"
              title="Drive Plan"
              meta={familyDirections ? `${formatDistance(familyDirections.distanceMeters)} · ${formatDuration(familyDirections.durationSeconds)}` : undefined}
            />
            <div className="space-y-0">
              {(familyRoute.waypoints || []).map((wp, idx) => {
                const isLast = idx === (familyRoute.waypoints || []).length - 1
                const leg = familyDirections?.legs?.[idx]
                const prevLegsDuration = (familyDirections?.legs || []).slice(0, idx).reduce((s, l) => s + (l?.duration || 0), 0)
                const cumulativeMin = Math.round(prevLegsDuration / 60)
                const hour = Math.floor(cumulativeMin / 60)
                const min = cumulativeMin % 60
                const eta = idx === 0 ? 'Departure' : `+${hour > 0 ? `${hour}h ` : ''}${min}m`

                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'h-2.5 w-2.5 rounded-full border-2',
                        idx === 0 ? 'border-success bg-success-soft' : isLast ? 'border-info bg-info-soft' : 'border-warning bg-warning-soft'
                      )} />
                      {!isLast && <div className="mt-1 w-px flex-1 bg-border-default/50" />}
                    </div>
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
            {!familyDirections && (
              <div className="mt-2 text-[10px] text-text-muted">Calculating route...</div>
            )}
          </section>
        )}

        {/* Related tasks */}
        {entity.type === 'family' && (
          <section className="border border-border-default bg-bg-surface">
            <div className="border-b border-border-default px-4 py-3">
              <SectionTitle eyebrow="Checklist" title="Planning tasks" meta={taskCompletion} />
            </div>
            <div className="p-4">
              {relatedTasks.length ? (
                <div className="-mx-4 mb-4 border-y border-border-default">
                  {relatedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={onToggleTaskStatus}
                      families={families}
                    />
                  ))}
                </div>
              ) : (
                <div className="mb-4 text-[11px] text-text-secondary">
                  No linked tasks yet. Add one below if this unit needs follow-up.
                </div>
              )}
              {isEditor && (
                <div className="flex gap-2">
                  <input
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    placeholder="Add a task tied to this unit..."
                    className="flex-1 border border-border-default bg-bg-base px-3 py-2 text-[11px] text-text-primary outline-none focus:border-info"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickTask.trim()) {
                        onAddTask?.({
                          trip_id: tripId,
                          title: quickTask.trim(),
                          assigned_family_id: entity.id,
                          status: 'open',
                        })
                        setQuickTask('')
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!quickTask.trim()) return
                      onAddTask?.({
                        trip_id: tripId,
                        title: quickTask.trim(),
                        assigned_family_id: entity.id,
                        status: 'open',
                      })
                      setQuickTask('')
                    }}
                    className="border border-border-default bg-bg-base px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text-primary transition-colors hover:border-info/40 hover:text-info"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related expenses for family */}
        {relatedExpenses.length > 0 && (
          <section className="border border-border-default bg-bg-surface p-4">
            <SectionTitle eyebrow="Finance" title="Linked expenses" meta={`$${relatedExpenses.reduce((s, e) => s + (e.amount || 0), 0).toFixed(0)}`} />
            <div className="space-y-2">
              {relatedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border border-border-default bg-bg-panel px-3 py-2"
                >
                  <span className="text-[11px] text-text-primary">{expense.title}</span>
                  <span className="text-[11px] font-bold text-text-primary">${expense.amount?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        <section className="border border-border-default bg-bg-surface p-4">
          <SectionTitle eyebrow="Notes" title="Decisions and context" />
          <textarea
            value={entity.note || ''}
            onChange={(e) => onUpdateEntityNote?.(entity.type, entity.id, e.target.value)}
            placeholder="Capture planning notes, constraints, decisions, or reminders..."
            className="min-h-24 w-full resize-none border border-border-default bg-bg-base px-3 py-2 text-[11px] leading-relaxed text-text-primary outline-none focus:border-info"
          />
        </section>

        {/* Members (always at bottom) */}
        <section className="border border-border-default bg-bg-surface">
          <div className="border-b border-border-default px-4 py-3">
            <SectionTitle eyebrow="Collaboration" title="Trip Members" meta={`${members.length}`} />
          </div>
          <div className="p-4">
            <MembersPanel
              members={members}
              membersLoading={membersLoading}
              isEditor={isEditor}
              role={role}
            />
          </div>
        </section>
      </div>
    </aside>
  )
}
