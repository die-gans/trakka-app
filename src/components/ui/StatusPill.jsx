import { cn } from '../../lib/utils'

const STATUS_STYLES = {
  Transit: 'bg-info-soft text-info',
  'Roll Out': 'bg-warning-soft text-warning',
  Assigned: 'bg-info-soft text-info',
  Pending: 'bg-warning-soft text-warning',
  Open: 'bg-warning-soft text-warning',
  Settled: 'bg-success-soft text-success',
  Go: 'bg-success-soft text-success',
  Watch: 'bg-warning-soft text-warning',
  done: 'bg-success-soft text-success',
  open: 'bg-warning-soft text-warning',
}

export function StatusPill({ children, tone = 'Transit', className }) {
  return (
    <span
      className={cn(
        'rounded-[2px] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
        STATUS_STYLES[tone] || 'bg-bg-elevated text-text-secondary',
        className,
      )}
    >
      {children}
    </span>
  )
}
