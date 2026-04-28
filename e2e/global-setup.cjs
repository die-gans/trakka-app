const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const SESSION_FILE = path.join(__dirname, '..', '.e2e-session.json')

async function globalSetup() {
  // Dynamic import of ESM modules from CommonJS
  const { createClient } = await import('@supabase/supabase-js')
  const seedModule = await import('../src/data/seedTrip.js')

  const {
    TRIP_META,
    INITIAL_FAMILIES,
    INITIAL_LOCATIONS,
    INITIAL_ROUTES,
    INITIAL_MEALS,
    INITIAL_TASKS,
    INITIAL_EXPENSES,
    INITIAL_ITINERARY_ITEMS,
  } = seedModule

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  // Sign in with dev test user (anonymous is disabled on this local Supabase)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'e2e@test.app',
    password: 'testpass123',
  })
  if (authError) {
    console.error('E2E setup: Sign-in failed:', authError.message)
    throw authError
  }

  const user = authData.user
  const session = authData.session
  console.log('E2E setup: Signed in anonymously as', user.id)

  // Save session for tests
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session))

  // Check if Jervis Bay trip already exists
  const { data: existingTrip } = await supabase
    .from('trips')
    .select('id')
    .eq('title', TRIP_META.title)
    .single()

  if (existingTrip) {
    console.log('E2E setup: Jervis Bay trip already exists, skipping seed')
    fs.writeFileSync(path.join(__dirname, '..', '.e2e-trip-id.json'), JSON.stringify({ tripId: existingTrip.id }))
    return
  }

  console.log('E2E setup: Seeding Jervis Bay trip...')

  // 1. Create trip (let Supabase generate UUID)
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      title: TRIP_META.title,
      command_name: TRIP_META.command_name,
      start_date: TRIP_META.start_date,
      end_date: TRIP_META.end_date,
      basecamp_address: TRIP_META.basecamp_address,
      basecamp_lat: TRIP_META.basecamp_lat,
      basecamp_lng: TRIP_META.basecamp_lng,
      created_by: user.id,
    })
    .select()
    .single()

  if (tripError) throw tripError
  console.log('E2E setup: Created trip', trip.id)

  // Save trip ID for tests
  fs.writeFileSync(path.join(__dirname, '..', '.e2e-trip-id.json'), JSON.stringify({ tripId: trip.id }))

  // 2. Add self as organizer + editor
  await supabase.from('trip_members').insert({
    trip_id: trip.id,
    user_id: user.id,
    role: 'organizer',
    permission: 'editor',
  })

  // 3. Create families
  const familyMap = {}
  for (const family of INITIAL_FAMILIES) {
    const { data: fam, error: famError } = await supabase
      .from('families')
      .insert({
        trip_id: trip.id,
        name: family.name,
        short_origin: family.shortOrigin,
        origin: family.origin,
        origin_lat: family.originCoordinates?.lat,
        origin_lng: family.originCoordinates?.lng,
        status: family.status,
        eta: family.eta,
        drive_time: family.driveTime,
        headcount: family.headcount,
        vehicle: family.vehicle,
        responsibility: family.responsibility,
        readiness: family.readiness,
      })
      .select()
      .single()

    if (famError) throw famError
    familyMap[family.id] = fam.id

    // Checklist items
    if (family.checklist?.length > 0) {
      const checklistItems = family.checklist.map((item) => ({
        family_id: fam.id,
        label: item.label,
        done: item.done,
      }))
      await supabase.from('checklist_items').insert(checklistItems)
    }
  }

  // 4. Create locations
  const locationMap = {}
  for (const location of INITIAL_LOCATIONS) {
    const { data: loc, error: locError } = await supabase
      .from('locations')
      .insert({
        trip_id: trip.id,
        title: location.title,
        category: location.category,
        day_id: location.dayId,
        address: location.address,
        lat: location.coordinates?.lat,
        lng: location.coordinates?.lng,
        external_url: location.externalUrl,
        summary: location.summary,
      })
      .select()
      .single()

    if (locError) throw locError
    locationMap[location.id] = loc.id
  }

  // 5. Create routes
  for (const route of INITIAL_ROUTES) {
    const familyDbId = familyMap[route.familyId]
    await supabase.from('routes').insert({
      trip_id: trip.id,
      family_id: familyDbId,
      title: route.familyId?.replace('-', ' ') || route.id,
      focus_day: route.focusDay,
      tone: route.tone,
      path: route.path,
    })
  }

  // 6. Create meals
  for (const meal of INITIAL_MEALS) {
    await supabase.from('meals').insert({
      trip_id: trip.id,
      day_id: meal.dayId,
      meal: meal.meal,
      owner: meal.owner,
      status: meal.status,
      note: meal.note,
    })
  }

  // 7. Create tasks
  for (const task of INITIAL_TASKS) {
    await supabase.from('tasks').insert({
      trip_id: trip.id,
      title: task.title,
      day_id: task.dayId,
      status: task.status,
      assigned_family_id: familyMap[task.assignedFamilyId],
    })
  }

  // 8. Create expenses
  for (const expense of INITIAL_EXPENSES) {
    await supabase.from('expenses').insert({
      trip_id: trip.id,
      title: expense.title,
      amount: expense.amount,
      payer_family_id: familyMap[expense.payerFamilyId],
      allocation_mode: expense.allocationMode,
      allocations: {},
    })
  }

  // 9. Create itinerary items
  const ROW_ID_MAP = {
    transport: 'travel',
    ops: 'activities',
    activity: 'activities',
    food: 'support',
  }

  for (const item of INITIAL_ITINERARY_ITEMS) {
    const { data: itinItem, error: itinError } = await supabase
      .from('itinerary_items')
      .insert({
        trip_id: trip.id,
        row_id: ROW_ID_MAP[item.row_id] || item.row_id,
        day_id: item.day_id,
        title: item.title,
        start_slot: item.start_slot,
        span: item.span,
        color: item.color,
      })
      .select()
      .single()

    if (itinError) throw itinError

    // Link families
    if (item.family_ids?.length > 0) {
      const familyLinks = item.family_ids
        .map((fid) => familyMap[fid])
        .filter(Boolean)
        .map((fid) => ({
          itinerary_item_id: itinItem.id,
          family_id: fid,
        }))
      if (familyLinks.length > 0) {
        await supabase.from('itinerary_item_families').insert(familyLinks)
      }
    }
  }

  console.log('E2E setup: Seeding complete ✅')
  console.log('E2E setup: Trip ID:', trip.id)
}

module.exports = globalSetup
