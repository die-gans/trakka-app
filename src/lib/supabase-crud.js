import { supabase } from './supabase'

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

// ============================================
// TRIPS
// ============================================

export async function getTrip(tripId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()
  if (error) throw error
  return data
}

export async function getTripsForUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_members!inner(user_id)
    `)
    .eq('trip_members.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTrip(trip) {
  const { data: { user } } = await supabase.auth.getUser()
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

// ============================================
// LOCATIONS
// ============================================

export async function getLocations(tripId) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================
// ROUTES
// ============================================

export async function getRoutes(tripId) {
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
  if (DEV_BYPASS) {
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
  if (DEV_BYPASS) {
    return { permission: 'editor', role: 'organizer' }
  }

  const { data: { user } } = await supabase.auth.getUser()
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
