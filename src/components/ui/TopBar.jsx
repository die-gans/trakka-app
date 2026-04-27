import { memo } from 'react'
import { Search, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'

export const TopBar = memo(function TopBar({ tripName, families, activeFamily, onFamilyChange, searchQuery, onSearchChange, onSignOut }) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-border-default bg-bg-surface px-6">
      {/* Left: classification + trip name */}
      <div className="flex items-center gap-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-success">
          UNCLASSIFIED // TRAKKA OPS
        </div>
        <div className="h-5 w-px bg-border-default" />
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          {tripName}
        </div>
      </div>

      {/* Right: family switcher + autosave + search + sign out */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary">
            Working as
          </div>
          <div className="flex items-center gap-1.5">
            {families.map((family) => (
              <button
                key={family.id}
                type="button"
                onClick={() => onFamilyChange(family.id)}
                className={cn(
                  'border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]',
                  activeFamily === family.id
                    ? 'border-info/50 bg-info-soft text-text-primary'
                    : 'border-border-default bg-bg-panel text-text-secondary',
                )}
              >
                {family.short_origin || family.shortOrigin || '?'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2px] border border-border-default bg-bg-panel px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-info">
          autosave live
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-64 rounded-[2px] border border-border-default bg-bg-panel py-1.5 pl-10 pr-4 text-[11px] text-text-primary outline-none focus:border-info"
          />
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1.5 border border-border-default bg-bg-panel px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors hover:border-critical/50 hover:text-critical"
          >
            <LogOut size={12} />
            Exit
          </button>
        )}
      </div>
    </div>
  )
})
