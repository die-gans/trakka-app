import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  getTrip,
  getFamilies,
  getMeals,
  getTasks,
  getExpenses,
  updateFamily,
  toggleChecklistItem,
  updateMeal,
  updateTask,
  subscribeToTable,
} from '../lib/supabase-crud'

const TRIP_ID = 'trip-jervis-bay-2026' // TODO: make dynamic

export function useTrip() {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTrip(TRIP_ID)
      setTrip(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load trip:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { trip, loading, error, refresh: load }
}

export function useFamilies() {
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getFamilies(TRIP_ID)
      setFamilies(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load families:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Realtime updates
  useEffect(() => {
    const channel = subscribeToTable(
      'families',
      `trip_id=eq.${TRIP_ID}`,
      () => load()
    )
    return () => { supabase.removeChannel(channel) }
  }, [load])

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

export function useMeals() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getMeals(TRIP_ID)
      setMeals(data)
    } catch (err) {
      console.error('Failed to load meals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

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

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getTasks(TRIP_ID)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

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

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getExpenses(TRIP_ID)
      setExpenses(data)
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { expenses, loading, refresh: load }
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
