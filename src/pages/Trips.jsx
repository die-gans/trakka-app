import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, MapPin, Calendar, Users } from 'lucide-react'
import { getTripsForUser } from '../lib/supabase-crud'
import { signOut } from '../lib/supabase'

export function Trips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTripsForUser().then((data) => {
      setTrips(data)
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-border-default bg-bg-panel">
        <div className="flex h-14 items-center border-b border-border-default px-6">
          <div className="text-[12px] font-black uppercase tracking-[0.2em] text-info">
            TRAKKA
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-3">
            Your Trips
          </div>
          {loading ? (
            <div className="text-[11px] text-text-muted">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-[11px] text-text-muted">No trips yet</div>
          ) : (
            <div className="space-y-1">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="flex w-full items-center gap-3 rounded-[2px] px-3 py-2 text-left transition-colors hover:bg-bg-elevated"
                >
                  <MapPin size={14} className="text-info flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold text-text-primary">
                      {trip.title}
                    </div>
                    <div className="text-[9px] text-text-secondary">
                      {trip.start_date} → {trip.end_date}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border-default p-4">
          <button
            onClick={handleSignOut}
            className="text-[10px] font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-critical"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border-default bg-bg-surface px-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-success">
            UNCLASSIFIED // TRAKKA OPS
          </div>
        </div>

        <div className={`flex-1 overflow-auto ${trips.length === 0 && !loading ? 'flex items-center justify-center' : ''}`}>
          {trips.length === 0 && !loading ? (
            /* ─── Empty State ─── */
            <div className="w-full max-w-sm px-8 py-12 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                Command Centre
              </div>
              <h1 className="mt-2 text-[28px] font-black uppercase leading-none tracking-[0.06em] text-text-primary">
                Active Operations
              </h1>
              <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">
                Plan, coordinate, and execute trips with your convoy.
              </p>

              <button
                onClick={() => navigate('/trips/new')}
                className="group mt-8 flex w-full items-center gap-4 border-2 border-dashed border-info/40 bg-bg-surface/50 p-5 text-left transition-colors hover:border-info hover:bg-bg-elevated/30"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-info/30 bg-bg-panel transition-colors group-hover:border-info/60">
                  <Plus size={24} className="text-info" />
                </div>
                <div>
                  <div className="text-[13px] font-black uppercase tracking-[0.1em] text-text-primary">
                    New Operation
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-text-secondary">
                    Set up a trip with basecamp, dates, and family units
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* ─── Trips List ─── */
            <div className="p-8">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-info">
                    Command Centre
                  </div>
                  <h1 className="mt-1 text-[22px] font-black uppercase tracking-[0.08em] text-text-primary">
                    Active Operations
                  </h1>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                    Plan, coordinate, and execute trips with your convoy. Create a new operation or select an existing one.
                  </p>
                </div>

                {/* Create new trip card */}
                <button
                  onClick={() => navigate('/trips/new')}
                  className="group mb-6 flex w-full items-center gap-4 border-2 border-dashed border-border-default bg-bg-surface p-6 transition-colors hover:border-info/50 hover:bg-bg-elevated/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-border-default bg-bg-panel group-hover:border-info/50">
                    <Plus size={24} className="text-info" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-black uppercase tracking-[0.1em] text-text-primary">
                      New Operation
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Set up a new trip with basecamp, dates, and family units
                    </div>
                  </div>
                </button>

                {/* Trip grid */}
                {trips.length > 0 && (
                  <div className="grid gap-3">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">
                      Existing Operations
                    </div>
                    {trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="flex items-center justify-between border border-border-default bg-bg-surface p-4 text-left transition-colors hover:bg-bg-elevated"
                      >
                        <div>
                          <div className="text-[14px] font-black uppercase tracking-[0.1em] text-text-primary">
                            {trip.title}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[10px] text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {trip.start_date} → {trip.end_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={10} />
                              {trip.command_name || 'No command name'}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={trip.status} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    planning: 'border-info bg-info-soft text-info',
    active: 'border-success bg-success-soft text-success',
    completed: 'border-text-muted bg-bg-panel text-text-muted',
    cancelled: 'border-critical bg-critical-soft text-critical',
  }
  return (
    <div className={`border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${colors[status] || colors.planning}`}>
      {status}
    </div>
  )
}
