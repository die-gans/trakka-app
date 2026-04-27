import { useState, useEffect, useRef } from 'react'
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

  const refresh = async () => {
    if (!tripId) return
    try {
      setLoading(true)
      const data = await getTrip(tripId)
      setTrip(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getTrip(tripId)
        if (!ignore) setTrip(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { trip, loading, error, refresh }
}

export function useFamilies(tripId) {
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getFamilies(tripId)
      setFamilies(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getFamilies(tripId)
        if (!ignore) setFamilies(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  // Realtime updates
  useEffect(() => {
    if (!tripId) return
    const channel = subscribeToTable(
      'families',
      `trip_id=eq.${tripId}`,
      () => refresh()
    )
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const toggleChecklist = async (itemId, done) => {
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
  }

  const updateReadiness = async (familyId) => {
    setFamilies((prev) => {
      const family = prev.find((f) => f.id === familyId)
      if (!family) return prev

      const completed = family.checklist_items.filter((i) => i.done).length
      const total = family.checklist_items.length
      const readiness = total > 0 ? Math.round((completed / total) * 100) : 0

      updateFamily(familyId, { readiness }).catch((err) => {
        console.error('Failed to update readiness:', err)
      })

      return prev.map((f) => (f.id === familyId ? { ...f, readiness } : f))
    })
  }

  return { families, loading, error, refresh, toggleChecklist, updateReadiness }
}

export function useMeals(tripId) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getMeals(tripId)
      setMeals(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getMeals(tripId)
        if (!ignore) setMeals(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  const updateStatus = async (mealId, status) => {
    try {
      await updateMeal(mealId, { status })
      setMeals((prev) =>
        prev.map((m) => (m.id === mealId ? { ...m, status } : m))
      )
    } catch (err) {
      console.error('Failed to update meal:', err)
    }
  }

  return { meals, loading, error, refresh, updateStatus }
}

export function useTasks(tripId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getTasks(tripId)
      setTasks(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getTasks(tripId)
        if (!ignore) setTasks(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  const toggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'open' : 'done'
    try {
      await updateTask(taskId, { status: newStatus })
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      )
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  return { tasks, loading, error, refresh, toggleStatus }
}

export function useExpenses(tripId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getExpenses(tripId)
      setExpenses(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getExpenses(tripId)
        if (!ignore) setExpenses(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { expenses, loading, error, refresh }
}

export function useLocations(tripId) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getLocations(tripId)
      setLocations(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getLocations(tripId)
        if (!ignore) setLocations(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { locations, loading, error, refresh }
}

export function useRoutes(tripId) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getRoutes(tripId)
      setRoutes(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getRoutes(tripId)
        if (!ignore) setRoutes(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { routes, loading, error, refresh }
}

export function useDirections(route) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    const waypoints = route?.waypoints || route?.path || []
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
  }, [route?.id, route?.waypoints, route?.path])

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
      setResults((prev) => {
        const next = { ...prev }
        fetched.forEach(({ id, data }) => {
          if (data) {
            next[id] = data
            fetchedRef.current.add(id)
          }
        })
        return next
      })
    })

    return () => { cancelled = true }
  }, [routes])

  return results
}

export function useItineraryItems(tripId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getItineraryItems(tripId)
      setItems(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getItineraryItems(tripId)
        if (!ignore) setItems(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { items, loading, error, refresh }
}

// ============================================
// PERMISSIONS & MEMBERS
// ============================================

export function useTripPermission(tripId) {
  const [permission, setPermission] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getMyTripPermission(tripId)
      if (data) {
        setPermission(data.permission)
        setRole(data.role)
      } else {
        setPermission(null)
        setRole(null)
      }
    } catch (err) {
      setError(err.message)
      setPermission(null)
      setRole(null)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getMyTripPermission(tripId)
        if (!ignore) {
          if (data) {
            setPermission(data.permission)
            setRole(data.role)
          } else {
            setPermission(null)
            setRole(null)
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message)
          setPermission(null)
          setRole(null)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  const isEditor = permission === 'editor' || role === 'organizer'
  const isViewer = permission === 'viewer' && role !== 'organizer'

  return { permission, role, isEditor, isViewer, loading, error, refresh }
}

export function useTripMembers(tripId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!tripId) return
    try {
      const data = await getTripMembers(tripId)
      setMembers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!tripId) {
        if (!ignore) setLoading(false)
        return
      }
      try {
        if (!ignore) setLoading(true)
        const data = await getTripMembers(tripId)
        if (!ignore) setMembers(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [tripId])

  return { members, loading, error, refresh }
}
