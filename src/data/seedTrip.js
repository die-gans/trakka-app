/**
 * TRAKKA Seed Trip — Australia Edition
 * Jervis Bay long weekend: Sydney + Melbourne + Canberra crews
 */

export const TRIP_META = {
  id: 'trip-jervis-bay-2026',
  title: 'Jervis Bay Long Weekend',
  command_name: 'Jervis Bay Command Centre',
  start_date: '2026-04-09',
  end_date: '2026-04-12',
  basecamp_address: 'Jervis Bay, NSW 2540',
  basecamp_lat: -35.1333,
  basecamp_lng: 150.7000,
}

export const DAYS = [
  {
    id: 'thu',
    shortLabel: 'Thu 4/09',
    title: 'Transit Day',
    weather: 'Sunny',
    temperature: '24°C',
    caution: 'Low',
  },
  {
    id: 'fri',
    shortLabel: 'Fri 4/10',
    title: 'Jervis Bay Local',
    weather: 'Partly Cloudy',
    temperature: '22°C',
    caution: 'Low',
  },
  {
    id: 'sat',
    shortLabel: 'Sat 4/11',
    title: 'Booderee Day',
    weather: 'Sunny',
    temperature: '23°C',
    caution: 'Medium',
  },
  {
    id: 'sun',
    shortLabel: 'Sun 4/12',
    title: 'Pack Up / Bug Out',
    weather: 'Showers',
    temperature: '19°C',
    caution: 'Low',
  },
]

export const TIME_SLOTS = ['00', '06', '12', '18']

export const DAY_BRIEFINGS = {
  thu: {
    code: 'Insertion / Consolidation',
    tone: 'Amber',
    summary:
      'Thursday is about getting everyone in cleanly. The main threat is staggered arrival timing, road fatigue, and losing momentum before basecamp is fully online. Win condition: all families reach Jervis Bay, get through the gate, settle basecamp, and keep dinner simple enough that nobody burns out on night one.',
    lookouts: [
      'Protect arrival energy. Long-drive families should prioritise clean breaks over pushing nonstop.',
      'Gate + check-in friction is the main avoidable failure point, so keep address, fee, and access details ready.',
      'Do not over-schedule the evening. Dinner and reset are the operation.',
    ],
  },
  fri: {
    code: 'Basecamp / Local Ops',
    tone: 'Blue',
    summary:
      'Friday is the stabilisation day. Everyone is in theatre, so the goal shifts from transit to rhythm: house setup, beach access, kid-friendly pacing, and preserving energy for the Booderee push. Keep the day flexible and bias toward a low-friction, high-enjoyment tempo.',
    lookouts: [
      'Parking, beach timing, and family split-ups can create unnecessary overhead if not lightly coordinated.',
      'Use this day to test house logistics, meal flow, and what each family actually needs before Saturday.',
      'Avoid turning the beach day into a checklist marathon. The point is to settle in.',
    ],
  },
  sat: {
    code: 'Booderee Main Mission',
    tone: 'Red',
    summary:
      'Saturday is the primary excursion and the highest-complexity day of the trip. This is the longest operating window with the most movement, the most dependency on traffic and timing, and the highest risk of decision fatigue. Win condition: enter Booderee smoothly, pick a manageable plan, and preserve enough margin for a calm return and cookout evening.',
    lookouts: [
      'Departure discipline matters more than itinerary ambition. Late starts compound quickly on park day.',
      'Pick a realistic park scope and protect turnaround timing before everyone gets tired.',
      'This is the day to simplify decisions, not multiply them.',
    ],
  },
  sun: {
    code: 'Exfil / Reset',
    tone: 'Green',
    summary:
      'Sunday is a controlled exit. The mission is not sightseeing, it is a clean departure: brunch, pack-out, house reset, and staggered family departures without chaos. The smoother the morning feels, the better the whole weekend lands in memory.',
    lookouts: [
      'Keep brunch simple and start pack-out early enough that checkout does not become the whole mood.',
      'Assign quiet ownership for trash, fridge sweep, and final vehicle loading.',
      'Avoid one-last-thing sprawl. The goal is a graceful exit, not extra complexity.',
    ],
  },
}

export const INITIAL_FAMILIES = [
  {
    id: 'sydney-crew',
    name: 'The Morrisons',
    shortOrigin: 'SYD',
    origin: 'Sydney',
    originCoordinates: { lat: -33.8688, lng: 151.2093 },
    status: 'Transit',
    eta: 'Thu 3:00 PM',
    driveTime: '2.5 hrs',
    headcount: '2 adults, 2 kids',
    vehicle: 'Prado',
    responsibility: 'BBQ kit + eskies',
    readiness: 85,
    checklist: [
      { id: 'car-pack', label: 'Car packed night before', done: true },
      { id: 'kid-bag', label: 'Beach toys + floaties', done: true },
      { id: 'groceries', label: 'Breakfast supplies sorted', done: false },
      { id: 'firewood', label: 'Pickup firewood on arrival', done: false },
    ],
  },
  {
    id: 'melbourne-crew',
    name: 'The Patels',
    shortOrigin: 'MEL',
    origin: 'Melbourne',
    originCoordinates: { lat: -37.8136, lng: 144.9631 },
    status: 'Transit',
    eta: 'Thu 5:00 PM',
    driveTime: '8 hrs',
    headcount: '2 adults, 1 kid',
    vehicle: 'Fortuner',
    responsibility: 'Snorkel gear + wetsuits',
    readiness: 72,
    checklist: [
      { id: 'snorkel', label: 'Snorkel gear checked', done: true },
      { id: 'wetsuits', label: 'Wetsuits packed', done: true },
      { id: 'accom', label: 'Cabin booking confirmed', done: true },
      { id: 'fuel', label: 'Full tank before Hume', done: false },
    ],
  },
  {
    id: 'canberra-crew',
    name: 'The O\'Briens',
    shortOrigin: 'CBR',
    origin: 'Canberra',
    originCoordinates: { lat: -35.2809, lng: 149.1300 },
    status: 'Transit',
    eta: 'Thu 2:30 PM',
    driveTime: '1.5 hrs',
    headcount: '2 adults',
    vehicle: 'Outback',
    responsibility: 'Camp kitchen + coffee',
    readiness: 91,
    checklist: [
      { id: 'kitchen', label: 'Camp kitchen packed', done: true },
      { id: 'coffee', label: 'Coffee kit + beans', done: true },
      { id: 'chairs', label: 'Camp chairs loaded', done: true },
      { id: 'table', label: 'Folding table', done: true },
    ],
  },
]

export const INITIAL_LOCATIONS = [
  {
    id: 'jervis-base',
    type: 'location',
    title: 'Jervis Bay Base',
    category: 'stay',
    dayId: 'all',
    address: 'Jervis Bay, NSW 2540',
    coordinates: { lat: -35.1333, lng: 150.7000 },
    summary: 'Base for the long weekend. Cabin + powered site setup.',
  },
  {
    id: 'hyams-beach',
    type: 'location',
    title: 'Hyams Beach',
    category: 'activity',
    dayId: 'fri',
    address: 'Hyams Beach, NSW 2540',
    coordinates: { lat: -35.1000, lng: 150.6833 },
    summary: 'Famous white sand beach. Friday arvo swim and reset.',
  },
  {
    id: 'booderee-park',
    type: 'location',
    title: 'Booderee National Park',
    category: 'park',
    dayId: 'sat',
    address: 'Booderee National Park, Jervis Bay, NSW',
    coordinates: { lat: -35.1500, lng: 150.7167 },
    summary: 'Saturday main run. Entry permit required.',
  },
  {
    id: 'huskisson-pub',
    type: 'location',
    title: 'Huskisson Pub',
    category: 'meal',
    dayId: 'fri',
    address: 'Huskisson, NSW 2540',
    coordinates: { lat: -35.0333, lng: 150.6667 },
    summary: 'Friday night feed. Booked for 6:30 PM.',
  },
]

export const INITIAL_ROUTES = [
  {
    id: 'route-syd-jervis',
    familyId: 'sydney-crew',
    focusDay: 'thu',
    tone: 'info',
    waypoints: [
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Kiama', lat: -34.6721, lng: 150.8547 },
      { name: 'Jervis Bay', lat: -35.1333, lng: 150.7000 },
    ],
    path: [
      { lat: -33.8688, lng: 151.2093 },
      { lat: -34.6721, lng: 150.8547 },
      { lat: -35.1333, lng: 150.7000 },
    ],
  },
  {
    id: 'route-mel-jervis',
    familyId: 'melbourne-crew',
    focusDay: 'thu',
    tone: 'warning',
    waypoints: [
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
      { name: 'Albury', lat: -36.0808, lng: 146.9165 },
      { name: 'Jervis Bay', lat: -35.1333, lng: 150.7000 },
    ],
    path: [
      { lat: -37.8136, lng: 144.9631 },
      { lat: -36.0808, lng: 146.9165 },
      { lat: -35.1333, lng: 150.7000 },
    ],
  },
  {
    id: 'route-cbr-jervis',
    familyId: 'canberra-crew',
    focusDay: 'thu',
    tone: 'success',
    waypoints: [
      { name: 'Canberra', lat: -35.2809, lng: 149.1300 },
      { name: 'Braidwood', lat: -35.4458, lng: 149.7997 },
      { name: 'Jervis Bay', lat: -35.1333, lng: 150.7000 },
    ],
    path: [
      { lat: -35.2809, lng: 149.1300 },
      { lat: -35.4458, lng: 149.7997 },
      { lat: -35.1333, lng: 150.7000 },
    ],
  },
]

export const INITIAL_MEALS = [
  { id: 'thu-dinner', dayId: 'thu', meal: 'Huskisson Pub', owner: 'Shared', status: 'Assigned', note: 'Friday night feed — booked for 6:30 PM' },
  { id: 'fri-breakfast', dayId: 'fri', meal: 'Basecamp brekkie', owner: 'Canberra Crew', status: 'Assigned', note: 'O\'Briens on coffee duty' },
  { id: 'fri-lunch', dayId: 'fri', meal: 'Beach picnic', owner: 'Shared', status: 'Pending', note: 'Grab supplies from Huskisson IGA' },
  { id: 'fri-dinner', dayId: 'fri', meal: 'BBQ at base', owner: 'Sydney Crew', status: 'Assigned', note: 'Morrisons bringing BBQ kit' },
  { id: 'sat-lunch', dayId: 'sat', meal: 'Packed lunch', owner: 'Shared', status: 'Pending', note: 'Sandwiches + fruit for Booderee day' },
  { id: 'sat-dinner', dayId: 'sat', meal: 'Fish and chips', owner: 'Shared', status: 'Open', note: 'Huskisson takeaway' },
]

export const INITIAL_EXPENSES = [
  { id: 'exp-accom', title: 'Accommodation', amount: 890, payerFamilyId: 'sydney-crew', allocationMode: 'equal' },
  { id: 'exp-bbq', title: 'BBQ supplies', amount: 145, payerFamilyId: 'sydney-crew', allocationMode: 'equal' },
  { id: 'exp-pub', title: 'Pub dinner', amount: 320, payerFamilyId: 'canberra-crew', allocationMode: 'equal' },
]

export const INITIAL_TASKS = [
  { id: 'task-bbq-kit', title: 'Pack BBQ kit + gas', dayId: 'thu', status: 'done', assignedFamilyId: 'sydney-crew' },
  { id: 'task-permits', title: 'Book Booderee entry permits', dayId: 'thu', status: 'done', assignedFamilyId: 'canberra-crew' },
  { id: 'task-eskies', title: 'Pack eskies + ice', dayId: 'thu', status: 'open', assignedFamilyId: 'sydney-crew' },
  { id: 'task-snorkel', title: 'Check snorkel gear fits kids', dayId: 'fri', status: 'open', assignedFamilyId: 'melbourne-crew' },
  { id: 'task-coffee', title: 'Grind coffee beans', dayId: 'fri', status: 'open', assignedFamilyId: 'canberra-crew' },
]

export const INITIAL_ITINERARY_ITEMS = [
  { id: 'item-1', trip_id: 'trip-jervis-bay-2026', title: 'Depart Sydney', day_id: 'thu', row_id: 'travel', start_slot: 6, span: 1, color: 'info', family_ids: ['sydney-crew'], linked_entities: [{ type: 'route', id: 'route-syd-jervis' }] },
  { id: 'item-2', trip_id: 'trip-jervis-bay-2026', title: 'Depart Melbourne', day_id: 'thu', row_id: 'travel', start_slot: 0, span: 2, color: 'warning', family_ids: ['melbourne-crew'], linked_entities: [{ type: 'route', id: 'route-mel-jervis' }] },
  { id: 'item-3', trip_id: 'trip-jervis-bay-2026', title: 'Depart Canberra', day_id: 'thu', row_id: 'travel', start_slot: 12, span: 1, color: 'success', family_ids: ['canberra-crew'], linked_entities: [{ type: 'route', id: 'route-cbr-jervis' }, { type: 'task', id: 'task-permits' }] },
  { id: 'item-4', trip_id: 'trip-jervis-bay-2026', title: 'Basecamp Setup', day_id: 'thu', row_id: 'activities', start_slot: 18, span: 1, color: 'info', family_ids: ['sydney-crew', 'melbourne-crew', 'canberra-crew'], linked_entities: [{ type: 'location', id: 'jervis-base' }, { type: 'task', id: 'task-eskies' }] },
  { id: 'item-5', trip_id: 'trip-jervis-bay-2026', title: 'Hyams Beach Swim', day_id: 'fri', row_id: 'activities', start_slot: 12, span: 1, color: 'success', family_ids: ['sydney-crew', 'melbourne-crew', 'canberra-crew'], linked_entities: [{ type: 'location', id: 'hyams-beach' }, { type: 'meal', id: 'fri-lunch' }] },
  { id: 'item-6', trip_id: 'trip-jervis-bay-2026', title: 'Huskisson Pub', day_id: 'fri', row_id: 'support', start_slot: 18, span: 1, color: 'warning', family_ids: ['sydney-crew', 'melbourne-crew', 'canberra-crew'], linked_entities: [{ type: 'location', id: 'huskisson-pub' }, { type: 'expense', id: 'exp-pub' }] },
  { id: 'item-7', trip_id: 'trip-jervis-bay-2026', title: 'Booderee Run', day_id: 'sat', row_id: 'activities', start_slot: 6, span: 2, color: 'critical', family_ids: ['sydney-crew', 'melbourne-crew', 'canberra-crew'], linked_entities: [{ type: 'location', id: 'booderee-park' }, { type: 'meal', id: 'sat-lunch' }, { type: 'task', id: 'task-permits' }] },
]
