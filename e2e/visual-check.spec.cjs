const { test, expect } = require('@playwright/test')
const fs = require('fs')

const SESSION = JSON.parse(fs.readFileSync('/tmp/trakka_session.json', 'utf8'))
const AUTH_KEY = 'sb-127-auth-token'

async function injectAuth(page) {
  await page.goto('http://localhost:5173/login')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
  }, { key: AUTH_KEY, session: SESSION })
}

async function capture(page, name) {
  const path = `/tmp/trakka-visual-${name}.png`
  await page.screenshot({ path, fullPage: true })
  console.log(`📸 ${name}: ${path}`)
}

test('visual check — all dashboard views', async ({ page }) => {
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(err.message))

  // Auth + navigate to mock trip
  await injectAuth(page)
  await page.goto('http://localhost:5173/trips/trip-jervis-bay-2026')
  await page.waitForTimeout(2500)
  await capture(page, '01-dashboard-families')

  // Navigate to Map
  const mapNav = page.locator('button', { hasText: /Map/i }).first()
  if (await mapNav.isVisible().catch(() => false)) {
    await mapNav.click()
    await page.waitForTimeout(2500)
    await capture(page, '02-dashboard-map')
  }

  // Navigate to Itinerary
  const itinNav = page.locator('button', { hasText: /Itinerary/i }).first()
  if (await itinNav.isVisible().catch(() => false)) {
    await itinNav.click()
    await page.waitForTimeout(2500)
    await capture(page, '03-dashboard-itinerary')
  }

  // Navigate to Meals
  const mealsNav = page.locator('button', { hasText: /Meals/i }).first()
  if (await mealsNav.isVisible().catch(() => false)) {
    await mealsNav.click()
    await page.waitForTimeout(1500)
    await capture(page, '04-dashboard-meals')
  }

  // Navigate to Tasks
  const tasksNav = page.locator('button', { hasText: /Tasks/i }).first()
  if (await tasksNav.isVisible().catch(() => false)) {
    await tasksNav.click()
    await page.waitForTimeout(1500)
    await capture(page, '05-dashboard-tasks')
  }

  // Navigate to Expenses
  const expNav = page.locator('button', { hasText: /Expenses/i }).first()
  if (await expNav.isVisible().catch(() => false)) {
    await expNav.click()
    await page.waitForTimeout(1500)
    await capture(page, '06-dashboard-expenses')
  }

  // Back to Families, click a family to open InspectorRail
  const famNav = page.locator('button', { hasText: /Families/i }).first()
  if (await famNav.isVisible().catch(() => false)) {
    await famNav.click()
    await page.waitForTimeout(1500)
    const familyCard = page.locator('button', { hasText: /The Morrisons/i }).first()
    if (await familyCard.isVisible().catch(() => false)) {
      await familyCard.click()
      await page.waitForTimeout(1000)
      await capture(page, '07-inspector-family')
    }
  }

  // Click Drive Plan expand on family card
  const drivePlanBtn = page.locator('button', { hasText: /Drive Plan/i }).first()
  if (await drivePlanBtn.isVisible().catch(() => false)) {
    await drivePlanBtn.click()
    await page.waitForTimeout(1500)
    await capture(page, '08-drive-plan-expanded')
  }

  if (consoleErrors.length > 0) {
    console.log('\n❌ Console errors found:')
    consoleErrors.forEach(e => console.log('  -', e))
  } else {
    console.log('\n✅ No console errors')
  }

  console.log('\nAll screenshots saved to /tmp/trakka-visual-*.png')
})
