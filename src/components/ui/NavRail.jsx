import { cn } from '../../lib/utils'
import {
  LayoutGrid,
  Home,
  Utensils,
  Map,
  MapPin,
  Receipt,
  Users,
  Download,
  MessageSquare,
  Settings,
  ListChecks,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'itinerary', label: 'Itinerary', icon: LayoutGrid },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'stay', label: 'Stay', icon: Home },
  { id: 'meals', label: 'Meals', icon: Utensils },
  { id: 'activities', label: 'Activities', icon: Map },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'families', label: 'Families', icon: Users },
]

export function NavRail({ activePage, onPageChange }) {
  return (
    <div className="flex w-16 flex-col border-r border-border-default bg-bg-panel">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-border-default">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-info">
          TRK
        </div>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onPageChange(item.id)}
            className={cn(
              'flex items-center justify-center border-l-2 px-3 py-3.5 transition-colors',
              active
                ? 'border-info bg-bg-elevated text-info'
                : 'border-transparent text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary',
            )}
            title={item.label}
          >
            <Icon size={22} strokeWidth={1.6} />
          </button>
        )
      })}

      {/* Bottom actions */}
      <div className="mt-auto border-t border-border-default">
        <button
          type="button"
          className="flex w-full items-center justify-center px-3 py-3.5 text-text-secondary transition-colors hover:bg-bg-elevated/50 hover:text-text-primary"
          title="Export trip state"
        >
          <Download size={20} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center px-3 py-3.5 text-text-secondary transition-colors hover:bg-bg-elevated/50 hover:text-text-primary"
          title="Messages"
        >
          <MessageSquare size={20} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center px-3 py-3.5 text-text-secondary transition-colors hover:bg-bg-elevated/50 hover:text-text-primary"
          title="Settings"
        >
          <Settings size={20} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}
