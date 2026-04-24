/**
 * Seed to Supabase Migration Script
 * Run this in the browser console after running schema.sql
 * Populates the database with the Jervis Bay trip data
 */

import { supabase } from '../lib/supabase'
import {
  TRIP_META,
  INITIAL_FAMILIES,
  INITIAL_MEALS,
  INITIAL_TASKS,
  INITIAL_EXPENSES,
  INITIAL_LOCATIONS,
  INITIAL_ROUTES,
  DAYS,
} from '../data/seedTrip'

export async function seedTripToSupabase() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Must be signed in to seed data')
  }

  console.log('TRAKKA: Seeding trip to Supabase...')

  // 1. Create the trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      id: TRIP_META.id,
      title: TRIP_META.title,
      command_name: TRIP_META.commandName,
      start_date: TRIP_META.startDate,
      end_date: TRIP_META.endDate,
      basecamp_address: TRIP_META.basecampAddress,
      basecamp_lat: TRIP_META.basecampCoordinates.lat,
      basecamp_lng: TRIP_META.basecampCoordinates.lng,
      created_by: user.id,
    })
    .select()
    .single()

  if (tripError) {
    // If trip already exists, skip
    if (tripError.code === '23505') {
      console.log('TRAKKA: Trip already exists, skipping seed')
      return { trip: { id: TRIP_META.id }, seeded: false }
    }
    throw tripError
  }

  console.log('TRAKKA: Created trip:', trip.id)

  // 2. Add creator as organizer + editor
  await supabase.from('trip_members').insert({
    trip_id: trip.id,
    user_id: user.id,
    role: 'organizer',
    permission: 'editor',
  })

  // 3. Create families with checklists
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

    // Create checklist items for this family
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
  for (const location of INITIAL_LOCATIONS) {
    await supabase.from('locations').insert({
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
  }

  // 5. Create routes
  for (const route of INITIAL_ROUTES) {
    // Get family_id from short_origin mapping
    const { data: families } = await supabase
      .from('families')
      .select('id, short_origin')
      .eq('trip_id', trip.id)

    const family = families?.find((f) => f.short_origin === route.familyId?.replace('-crew', ''))

    await supabase.from('routes').insert({
      trip_id: trip.id,
      family_id: family?.id,
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
    // Find family by assignedFamilyId
    const { data: families } = await supabase
      .from('families')
      .select('id')
      .eq('trip_id', trip.id)

    const familyMap = {
      'sydney-crew': families?.find((f) => f.name.includes('Morison')),
      'melbourne-crew': families?.find((f) => f.name.includes('Patel')),
      'canberra-crew': families?.find((f) => f.name.includes('O\'Brien')),
    }

    await supabase.from('tasks').insert({
      trip_id: trip.id,
      title: task.title,
      day_id: task.dayId,
      status: task.status,
      assigned_family_id: familyMap[task.assignedFamilyId]?.id,
    })
  }

  // 8. Create expenses
  for (const expense of INITIAL_EXPENSES) {
    const { data: families } = await supabase
      .from('families')
      .select('id')
      .eq('trip_id', trip.id)

    const familyMap = {
      'sydney-crew': families?.find((f) => f.name.includes('Morison')),
      'melbourne-crew': families?.find((f) => f.name.includes('Patel')),
      'canberra-crew': families?.find((f) => f.name.includes('O\'Brien')),
    }

    await supabase.from('expenses').insert({
      trip_id: trip.id,
      title: expense.title,
      amount: expense.amount,
      payer_family_id: familyMap[expense.payerFamilyId]?.id,
      allocation_mode: expense.allocationMode,
      allocations: {},
    })
  }

  console.log('TRAKKA: Seeding complete!')
  return { trip, seeded: true }
}

// Helper to run from console
window.seedTrakka = seedTripToSupabase
