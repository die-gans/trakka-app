const { test, expect } = require('@playwright/test')
const { injectSession } = require('./test-helpers.cjs')

test('create a trip end-to-end', async ({ page }) => {
  test.setTimeout(60000)

  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(err.message))

  await injectSession(page)
  await page.goto('/trips/new')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/e2e-02-create-trip.png' })

  // ── Step 1: Trip Details ──
  await page.locator('input[placeholder="e.g. Jervis Bay Long Weekend"]').fill('E2E Test Trip')
  await page.locator('input[placeholder="e.g. Jervis Bay Command Centre"]').fill('E2E Command Centre')
  await page.locator('input[type="date"]').first().fill('2026-05-01')
  await page.locator('input[type="date"]').nth(1).fill('2026-05-03')

  // Basecamp autocomplete — type and select first suggestion
  await page.locator('input[placeholder="e.g. Jervis Bay, NSW 2540"]').fill('Jervis Bay NSW')
  await page.waitForTimeout(1000) // debounce 250ms + API roundtrip
  const bSuggestions = page.locator('button', { hasText: /Jervis Bay/i }).first()
  if (await bSuggestions.isVisible().catch(() => false)) {
    await bSuggestions.click()
    await page.waitForTimeout(300)
  }
  await page.screenshot({ path: '/tmp/e2e-03-step1-filled.png' })

  // Next to Step 2
  await page.locator('button', { hasText: /Next: Family Units/i }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/e2e-04-step2.png' })

  // ── Step 2: Family Units ──
  await page.locator('input[placeholder*="Family name"]').fill('The Testersons')
  await page.locator('input[placeholder*="Origin code"]').fill('SYD')

  // Origin autocomplete — type and select first suggestion
  await page.locator('input[placeholder="Origin city *"]').fill('Sydney')
  await page.waitForTimeout(1000)
  const oSuggestions = page.locator('button', { hasText: /Sydney/i }).first()
  if (await oSuggestions.isVisible().catch(() => false)) {
    await oSuggestions.click()
    await page.waitForTimeout(300)
  }

  await page.locator('input[placeholder="Headcount"]').fill('4')
  await page.locator('input[placeholder="Vehicle"]').fill('Toyota HiAce')
  await page.locator('input[placeholder="Responsibility"]').fill('Catering')
  await page.screenshot({ path: '/tmp/e2e-05-step2-filled.png' })

  // Next to Step 3
  await page.locator('button', { hasText: /Next: Route Planning/i }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/e2e-06-step3.png' })

  // ── Step 3: Route Planning ──
  // Origin and basecamp are already locked in; no intermediate stops needed.
  await page.locator('button', { hasText: /Review & Launch/i }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/e2e-07-step4.png' })

  // ── Step 4: Launch ──
  await page.locator('button', { hasText: /Launch Operation/i }).click()

  // Wait for navigation to trip dashboard
  await page.waitForURL(/\/trips\/[a-f0-9-]+/, { timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/e2e-08-dashboard.png' })

  // Verify dashboard loaded
  await expect(page.locator('text=E2E Command Centre').first()).toBeVisible()
  await expect(page.locator('text=The Testersons').first()).toBeVisible()

  if (consoleErrors.length > 0) {
    console.log('\n❌ Console errors:')
    consoleErrors.forEach(e => console.log(' ', e))
  }
  console.log('\n✅ E2E test passed: Trip created and dashboard loaded')
})
