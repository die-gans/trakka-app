/**
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} title
 * @property {string} commandName
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} basecampAddress
 * @property {{lat: number, lng: number}} basecampCoordinates
 * @property {Family[]} families
 * @property {Location[]} locations
 * @property {Route[]} routes
 * @property {ItineraryItem[]} itineraryItems
 * @property {Meal[]} meals
 * @property {Activity[]} activities
 * @property {Expense[]} expenses
 * @property {Task[]} tasks
 */

/**
 * @typedef {Object} Family
 * @property {string} id
 * @property {string} name
 * @property {string} shortOrigin
 * @property {string} origin
 * @property {string} status
 * @property {string} eta
 * @property {string} driveTime
 * @property {string} headcount
 * @property {string} vehicle
 * @property {string} responsibility
 * @property {number} readiness
 * @property {ChecklistItem[]} checklist
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} label
 * @property {boolean} done
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} category
 * @property {string} dayId
 * @property {string} address
 * @property {{lat: number, lng: number}} coordinates
 * @property {string} [externalUrl]
 * @property {string} [summary]
 */

/**
 * @typedef {Object} Route
 * @property {string} id
 * @property {string} familyId
 * @property {string} focusDay
 * @property {string} tone
 * @property {{lat: number, lng: number}[]} path
 * @property {number} [durationSeconds]
 * @property {number} [distanceMeters]
 */

/**
 * @typedef {Object} ItineraryItem
 * @property {string} id
 * @property {string} rowId
 * @property {string} dayId
 * @property {string} title
 * @property {number} startSlot
 * @property {number} span
 * @property {string} color
 * @property {string} [status]
 * @property {string[]} [familyIds]
 */

/**
 * @typedef {Object} Meal
 * @property {string} id
 * @property {string} dayId
 * @property {string} meal
 * @property {string} owner
 * @property {string} status
 * @property {string} [note]
 */

/**
 * @typedef {Object} Expense
 * @property {string} id
 * @property {string} title
 * @property {number} amount
 * @property {string} payerFamilyId
 * @property {'equal'|'manual'|'individual'} allocationMode
 * @property {Record<string, number>} [allocations]
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} dayId
 * @property {string} status
 * @property {string} [assignedFamilyId]
 */

export {}
