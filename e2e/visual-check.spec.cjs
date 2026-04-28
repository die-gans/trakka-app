const { test, expect } = require('@playwright/test')
const { injectSession } = require('./test-helpers.cjs')

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

  // Auth + navigate to seeded Jervis Bay trip
  await injectSession(page)
  await page.goto('/trips')
  await page.waitForTimeout(1500)

  // Find and click the Jervis Bay trip card
  const jervisCard = page.locator('button, a', { hasText: /Jervis Bay Long Weekend/i }).first()
  if (await jervisCard.isVisible().catch(() => false)) {
    await jervisCard.click()
    await page.waitForTimeout(2500)
  } else {
    // Fallback: if we know the trip ID, navigate directly
    const fs = require('fs')
    const tripId = JSON.parse(fs.readFileSync('.e2e-trip-id.json', 'utf8')).tripId
    await page.goto(`/trips/${tripId}`)
    await page.waitForTimeout(2500)
  }
  await capture(page, '01-dashboard-families')

  // Navigate via nav rail (buttons have title attribute, no visible text)
  const clickNav = async (title) => {
    const btn = page.locator(`button[title="${title}"]`).first()
    if (await btn.isVisible().catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(2000)
      return true
    }
    return false
  }

  if (await clickNav('Situation')) await capture(page, '02-dashboard-situation')
  if (await clickNav('Itinerary')) await capture(page, '03-dashboard-itinerary')
  if (await clickNav('Meals')) await capture(page, '04-dashboard-meals')
  if (await clickNav('Tasks')) await capture(page, '05-dashboard-tasks')
  if (await clickNav('Expenses')) await capture(page, '06-dashboard-expenses')

  // Back to Families, click a family to open InspectorRail
  if (await clickNav('Families')) {
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
