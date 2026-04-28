const { test, expect } = require('@playwright/test')
const { injectSession } = require('./test-helpers.cjs')

test.skip('create a trip end-to-end', async ({ page }) => {
  test.setTimeout(60000)

  // Capture console errors
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(err.message))

  // Inject session and go directly to create trip
  await injectSession(page)
  await page.goto('/trips/new')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/e2e-02-create-trip.png' })

  // Step 1: Fill trip details
  await page.getByPlaceholder('e.g. Jervis Bay Long Weekend').fill('E2E Test Trip')
  await page.getByPlaceholder('e.g. Jervis Bay Command Centre').fill('E2E Command Centre')
  await page.locator('input[type="date"]').first().fill('2026-05-01')
  await page.locator('input[type="date"]').nth(1).fill('2026-05-03')

  // Set basecamp by clicking on the map
  const basecampMap = page.locator('text=Select Basecamp on Map').locator('..').locator('.mapboxgl-canvas-container').first()
  if (await basecampMap.isVisible().catch(() => false)) {
    await basecampMap.click({ position: { x: 200, y: 150 } })
    await page.waitForTimeout(1000)
  }
  await page.screenshot({ path: '/tmp/e2e-03-step1-filled.png' })

  // Click Next to Step 2
  const nextBtn = page.locator('button', { hasText: /Next: Family Units/i })
  await expect(nextBtn).toBeEnabled({ timeout: 5000 })
  await nextBtn.click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/e2e-04-step2.png' })

  // Step 2: Fill family details
  await page.locator('input[placeholder*="Family name"]').fill('The Testersons')
  await page.locator('input[placeholder*="Origin code"]').fill('SYD')

  // Set origin by clicking on the family origin map
  const originMap = page.locator('text=Unit 1').locator('..').locator('.mapboxgl-canvas-container').first()
  if (await originMap.isVisible().catch(() => false)) {
    await originMap.click({ position: { x: 200, y: 150 } })
    await page.waitForTimeout(1000)
  }

  await page.locator('input[placeholder*="Headcount"]').fill('4')
  await page.locator('input[placeholder*="Vehicle"]').fill('Toyota HiAce')
  await page.locator('input[placeholder*="Responsibility"]').fill('Catering')
  await page.screenshot({ path: '/tmp/e2e-05-step2-filled.png' })

  // Click Next to Step 3
  const nextRouteBtn = page.locator('button', { hasText: /Next: Route Planning/i })
  await expect(nextRouteBtn).toBeEnabled({ timeout: 5000 })
  await nextRouteBtn.click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/e2e-06-step3.png' })

  // Step 3: Route Planning — just click Next to Review
  const nextReviewBtn = page.locator('button', { hasText: /Next: Review/i })
  if (await nextReviewBtn.isVisible().catch(() => false)) {
    await nextReviewBtn.click()
    await page.waitForTimeout(800)
  }
  await page.screenshot({ path: '/tmp/e2e-07-step4.png' })

  // Step 4: Launch Operation
  await page.getByText('Launch Operation').click()

  // Wait for navigation to trip dashboard
  await page.waitForURL(/\/trips\/[a-f0-9-]+/, { timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/e2e-08-dashboard.png' })

  // Verify dashboard loaded
  await expect(page.locator('text=E2E Command Centre').first()).toBeVisible()
  await expect(page.locator('text=The Testersons').first()).toBeVisible()

  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors)
  }
  console.log('✅ E2E test passed: Trip created and dashboard loaded')
})
