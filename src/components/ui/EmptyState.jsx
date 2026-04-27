export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center border border-dashed border-border-default bg-bg-panel">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{title}</div>
      <div className="mt-1 text-[11px] text-text-secondary">{subtitle}</div>
    </div>
  )
}
