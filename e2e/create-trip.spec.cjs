const { test, expect } = require('@playwright/test')
const fs = require('fs')

const SESSION = JSON.parse(fs.readFileSync('/tmp/trakka_session.json', 'utf8'))
const AUTH_KEY = 'sb-127-auth-token'

test('create a trip end-to-end', async ({ page }) => {
  // Capture console errors
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(err.message))

  // Inject session and go to trips
  await page.goto('http://localhost:5173/login')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
  }, { key: AUTH_KEY, session: SESSION })

  await page.goto('http://localhost:5173/trips')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/e2e-01-trips.png' })

  // Click "New Operation" button
  const newOpBtn = page.locator('button', { hasText: /New Operation/i })
  await expect(newOpBtn).toBeVisible()
  await newOpBtn.click()

  // Wait for navigation
  await page.waitForURL('http://localhost:5173/trips/new', { timeout: 10000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/e2e-02-create-trip.png' })

  // Debug: save HTML if fields aren't found
  const saveDebug = async (name) => {
    const html = await page.content()
    require('fs').writeFileSync(`/tmp/e2e-${name}.html`, html)
  }

  // Step 1: Fill trip details
  // Use nth(0) for Trip Name, nth(1) for Command Centre, etc.
  const inputs = page.locator('input[type="text"]')
  await inputs.nth(0).fill('E2E Test Trip')
  await inputs.nth(1).fill('E2E Command Centre')
  await page.locator('input[type="date"]').first().fill('2026-05-01')
  await page.locator('input[type="date"]').nth(1).fill('2026-05-03')
  await inputs.nth(2).fill('Test Basecamp Address')
  await page.screenshot({ path: '/tmp/e2e-03-step1-filled.png' })

  // Click Next
  await page.getByText('Next: Family Units').click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/e2e-04-step2.png' })

  // Step 2: Add a family unit
  await page.locator('input[placeholder*="Family name"]').fill('The Testersons')
  await page.locator('input[placeholder*="Origin code"]').fill('SYD')
  await page.locator('input[placeholder*="Origin city"]').fill('Sydney')
  await page.locator('input[placeholder*="Headcount"]').fill('4')
  await page.locator('input[placeholder*="Vehicle"]').fill('Toyota HiAce')
  await page.locator('input[placeholder*="Responsibility"]').fill('Catering')
  await page.screenshot({ path: '/tmp/e2e-05-step2-filled.png' })

  // Click Review button (not the "Review & Launch" heading)
  await page.getByRole('button', { name: 'Review' }).click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/e2e-06-step3.png' })

  // Click Launch Operation
  await page.getByText('Launch Operation').click()

  // Wait for navigation to trip dashboard
  await page.waitForURL(/\/trips\/[a-f0-9-]+/, { timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/e2e-07-dashboard.png' })

  // Verify dashboard loaded by checking for command centre name or family name
  await expect(page.locator('text=E2E Command Centre').first()).toBeVisible()
  await expect(page.locator('text=The Testersons').first()).toBeVisible()

  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors)
  }
  console.log('✅ E2E test passed: Trip created and dashboard loaded')
})
