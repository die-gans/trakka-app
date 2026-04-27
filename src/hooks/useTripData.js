import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchDirections } from '../lib/directions'
import { supabase } from '../lib/supabase'
import {
  getTrip,
  getFamilies,
  getMeals,
  getTasks,
  getExpenses,
  getLocations,
  getRoutes,
  getItineraryItems,
  getTripMembers,
  getMyTripPermission,
  updateFamily,
  toggleChecklistItem,
  updateMeal,
  updateTask,
  subscribeToTable,
} from '../lib/supabase-crud'

export function useTrip(tripId) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getTrip(tripId)
      setTrip(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load trip:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { trip, loading, error, refresh: load }
}

export function useFamilies(tripId) {
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getFamilies(tripId)
      setFamilies(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load families:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  // Realtime updates
  useEffect(() => {
    if (!tripId) return
    const channel = subscribeToTable(
      'families',
      `trip_id=eq.${tripId}`,
      () => load()
    )
    return () => { supabase.removeChannel(channel) }
  }, [tripId, load])

  const toggleChecklist = useCallback(async (itemId, done) => {
    try {
      await toggleChecklistItem(itemId, done)
      setFamilies((prev) =>
        prev.map((family) => ({
          ...family,
          checklist_items: family.checklist_items.map((item) =>
            item.id === itemId ? { ...item, done } : item
          ),
        }))
      )
    } catch (err) {
      console.error('Failed to toggle checklist:', err)
    }
  }, [])

  const updateReadiness = useCallback(async (familyId) => {
    const family = families.find((f) => f.id === familyId)
    if (!family) return

    const completed = family.checklist_items.filter((i) => i.done).length
    const total = family.checklist_items.length
    const readiness = total > 0 ? Math.round((completed / total) * 100) : 0

    try {
      await updateFamily(familyId, { readiness })
      setFamilies((prev) =>
        prev.map((f) => (f.id === familyId ? { ...f, readiness } : f))
      )
    } catch (err) {
      console.error('Failed to update readiness:', err)
    }
  }, [families])

  return { families, loading, error, refresh: load, toggleChecklist, updateReadiness }
}

export function useMeals(tripId) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getMeals(tripId)
      setMeals(data)
    } catch (err) {
      console.error('Failed to load meals:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = useCallback(async (mealId, status) => {
    try {
      await updateMeal(mealId, { status })
      setMeals((prev) =>
        prev.map((m) => (m.id === mealId ? { ...m, status } : m))
      )
    } catch (err) {
      console.error('Failed to update meal:', err)
    }
  }, [])

  return { meals, loading, refresh: load, updateStatus }
}

export function useTasks(tripId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getTasks(tripId)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = useCallback(async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'open' : 'done'
    try {
      await updateTask(taskId, { status: newStatus })
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      )
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }, [])

  return { tasks, loading, refresh: load, toggleStatus }
}

export function useExpenses(tripId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getExpenses(tripId)
      setExpenses(data)
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { expenses, loading, refresh: load }
}

export function useLocations(tripId) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getLocations(tripId)
      setLocations(data)
    } catch (err) {
      console.error('Failed to load locations:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { locations, loading, refresh: load }
}

export function useRoutes(tripId) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getRoutes(tripId)
      setRoutes(data)
    } catch (err) {
      console.error('Failed to load routes:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { routes, loading, refresh: load }
}

export function useDirections(route) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  const waypoints = route?.waypoints || route?.path || []

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return
    if (fetchedRef.current) return

    let cancelled = false
    setLoading(true)
    fetchDirections(waypoints).then((data) => {
      if (cancelled) return
      if (data) {
        setResult(data)
        fetchedRef.current = true
      }
      setLoading(false)
    }).catch((err) => {
      if (cancelled) return
      setError(err)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [route?.id, waypoints])

  return { ...result, loading, error }
}

export function useAllDirections(routes) {
  const [results, setResults] = useState({})
  const fetchedRef = useRef(new Set())

  useEffect(() => {
    if (!routes?.length) return

    const toFetch = routes.filter((r) => {
      const waypoints = r?.waypoints || r?.path || []
      return waypoints.length >= 2 && !fetchedRef.current.has(r.id)
    })
    if (toFetch.length === 0) return

    let cancelled = false

    Promise.all(
      toFetch.map(async (route) => {
        const waypoints = route?.waypoints || route?.path || []
        const data = await fetchDirections(waypoints)
        return { id: route.id, data }
      })
    ).then((fetched) => {
      if (cancelled) return
      const next = { ...results }
      fetched.forEach(({ id, data }) => {
        if (data) {
          next[id] = data
          fetchedRef.current.add(id)
        }
      })
      setResults(next)
    })

    return () => { cancelled = true }
  }, [routes])

  return results
}

export function useItineraryItems(tripId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      const data = await getItineraryItems(tripId)
      setItems(data)
    } catch (err) {
      console.error('Failed to load itinerary items:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, refresh: load }
}

// Seed data fallback helper
export function useSeedFallback() {
  const [usingSeed, setUsingSeed] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Try to query trips table
      const { error } = await supabase.from('trips').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    checkConnection().then((connected) => {
      setUsingSeed(!connected)
    })
  }, [checkConnection])

  return usingSeed
}

// ============================================
// PERMISSIONS & MEMBERS
// ============================================

export function useTripPermission(tripId) {
  const [permission, setPermission] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getMyTripPermission(tripId)
      if (data) {
        setPermission(data.permission)
        setRole(data.role)
      } else {
        setPermission(null)
        setRole(null)
      }
    } catch (err) {
      console.error('Failed to load permission:', err)
      setPermission(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const isEditor = permission === 'editor' || role === 'organizer'
  const isViewer = permission === 'viewer' && role !== 'organizer'

  return { permission, role, isEditor, isViewer, loading, refresh: load }
}

export function useTripMembers(tripId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getTripMembers(tripId)
      setMembers(data)
    } catch (err) {
      console.error('Failed to load trip members:', err)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return { members, loading, refresh: load }
}
