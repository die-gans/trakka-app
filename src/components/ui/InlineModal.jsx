import { X } from 'lucide-react'

export function InlineModal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 p-4">
      <div className="w-full max-w-md border border-border-default bg-bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-default bg-bg-panel px-4 py-3">
          <h3 className="text-[12px] font-black uppercase tracking-[0.12em] text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
