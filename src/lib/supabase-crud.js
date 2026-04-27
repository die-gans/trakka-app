import { supabase } from './supabase'
import {
  TRIP_META,
  INITIAL_FAMILIES,
  INITIAL_MEALS,
  INITIAL_TASKS,
  INITIAL_EXPENSES,
  INITIAL_LOCATIONS,
  INITIAL_ROUTES,
  INITIAL_ITINERARY_ITEMS,
} from '../data/seedTrip'

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
const MOCK_TRIP_ID = TRIP_META.id

// ============================================
// TRIPS
// ============================================

export async function getTrip(tripId) {
  if (tripId === MOCK_TRIP_ID) return TRIP_META

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()
  if (error) throw error
  return data
}

export async function getTripsForUser() {
  let trips = []
  if (DEV_BYPASS) {
    trips.push(TRIP_META)
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return trips

  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_members!inner(user_id)
      `)
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      trips = [...trips, ...data]
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback:', err)
  }

  return trips
}

export async function createTrip(trip) {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('trips')
    .insert({ ...trip, created_by: user.id })
    .select()
    .single()

  if (error) throw error

  // Add creator as organizer + editor
  await supabase.from('trip_members').insert({
    trip_id: data.id,
    user_id: user.id,
    role: 'organizer',
    permission: 'editor',
  })

  return data
}

// ============================================
// FAMILIES
// ============================================

export async function getFamilies(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_FAMILIES

  const { data, error } = await supabase
    .from('families')
    .select(`
      *,
      checklist_items(*)
    `)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createFamily(family) {
  const { data, error } = await supabase
    .from('families')
    .insert(family)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFamily(id, updates) {
  const { data, error } = await supabase
    .from('families')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleChecklistItem(itemId, done) {
  const { data, error } = await supabase
    .from('checklist_items')
    .update({ done })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// MEALS
// ============================================

export async function getMeals(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_MEALS

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createMeal(meal) {
  const { data, error } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMeal(id, updates) {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMeal(id) {
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// TASKS
// ============================================

export async function getTasks(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_TASKS

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// EXPENSES
// ============================================

export async function getExpenses(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_EXPENSES

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(id, updates) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleExpenseSettled(id, settled) {
  return updateExpense(id, { settled })
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// LOCATIONS
// ============================================

export async function getLocations(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_LOCATIONS

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================
// ITINERARY ITEMS
// ============================================

export async function getItineraryItems(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_ITINERARY_ITEMS

  const { data, error } = await supabase
    .from('itinerary_items')
    .select(`
      *,
      itinerary_item_families(family_id)
    `)
    .eq('trip_id', tripId)
    .order('start_slot', { ascending: true })

  if (error) throw error
  return (data || []).map((item) => ({
    ...item,
    family_ids: item.itinerary_item_families?.map((f) => f.family_id) || [],
  }))
}

export async function createItineraryItem(item) {
  const { family_ids, ...itemData } = item
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert(itemData)
    .select()
    .single()

  if (error) throw error

  // Link families if provided
  if (family_ids?.length > 0) {
    await supabase.from('itinerary_item_families').insert(
      family_ids.map((fid) => ({ itinerary_item_id: data.id, family_id: fid }))
    )
  }

  return data
}

export async function updateItineraryItem(id, updates) {
  const { family_ids, ...itemData } = updates
  const { data, error } = await supabase
    .from('itinerary_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Re-link families if provided
  if (family_ids !== undefined) {
    await supabase.from('itinerary_item_families').delete().eq('itinerary_item_id', id)
    if (family_ids.length > 0) {
      await supabase.from('itinerary_item_families').insert(
        family_ids.map((fid) => ({ itinerary_item_id: id, family_id: fid }))
      )
    }
  }

  return data
}

export async function deleteItineraryItem(id) {
  const { error } = await supabase.from('itinerary_items').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// ROUTES
// ============================================

export async function getRoutes(tripId) {
  if (tripId === MOCK_TRIP_ID) return INITIAL_ROUTES

  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================
// TRIP MEMBERS & PERMISSIONS
// ============================================

export async function getTripMembers(tripId) {
  if (DEV_BYPASS || tripId === MOCK_TRIP_ID) {
    return [{
      id: 'dev-member-001',
      trip_id: tripId,
      user_id: 'dev-user-001',
      role: 'organizer',
      permission: 'editor',
      user: { name: 'Dev Operator', email: 'dev@trakka.local', avatar_url: null },
    }]
  }

  const { data, error } = await supabase
    .from('trip_members')
    .select(`
      *,
      user:users(name, email, avatar_url)
    `)
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getMyTripPermission(tripId) {
  if (DEV_BYPASS || tripId === MOCK_TRIP_ID) {
    return { permission: 'editor', role: 'organizer' }
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const { data, error } = await supabase
    .from('trip_members')
    .select('permission, role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    throw error
  }
  return data
}

export async function updateMemberPermission(tripId, userId, permission) {
  const { error } = await supabase
    .from('trip_members')
    .update({ permission })
    .eq('trip_id', tripId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function inviteMember(tripId, userId, permission = 'viewer') {
  const { data, error } = await supabase
    .from('trip_members')
    .insert({ trip_id: tripId, user_id: userId, permission })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToTable(table, filter, callback) {
  if (filter && filter.includes(MOCK_TRIP_ID)) {
    return { unsubscribe: () => {} } // No-op for mock data
  }

  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      callback
    )
    .subscribe()

  return channel
}
