/**
 * TRAKKA Seed Trip — Australia Edition
 * Jervis Bay long weekend: Sydney + Melbourne + Canberra crews
 */

export const TRIP_META = {
  id: 'trip-jervis-bay-2026',
  title: 'Jervis Bay Long Weekend',
  commandName: 'Jervis Bay Command Centre',
  startDate: '2026-04-09',
  endDate: '2026-04-12',
  basecampAddress: 'Jervis Bay, NSW 2540',
  basecampCoordinates: { lat: -35.1333, lng: 150.7000 },
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
    path: [
      { lat: -33.8688, lng: 151.2093 },
      { lat: -34.2000, lng: 150.8000 },
      { lat: -35.1333, lng: 150.7000 },
    ],
  },
  {
    id: 'route-mel-jervis',
    familyId: 'melbourne-crew',
    focusDay: 'thu',
    tone: 'warning',
    path: [
      { lat: -37.8136, lng: 144.9631 },
      { lat: -36.5000, lng: 147.3000 },
      { lat: -35.1333, lng: 150.7000 },
    ],
  },
  {
    id: 'route-cbr-jervis',
    familyId: 'canberra-crew',
    focusDay: 'thu',
    tone: 'success',
    path: [
      { lat: -35.2809, lng: 149.1300 },
      { lat: -35.2000, lng: 149.9000 },
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
