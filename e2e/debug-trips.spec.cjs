const { test, expect } = require('@playwright/test')
const fs = require('fs')
const { injectSession } = require('./test-helpers.cjs')

test('debug trips page', async ({ page }) => {
  await injectSession(page)
  await page.goto('/trips')
  await page.waitForTimeout(2000)

  const html = await page.content()
  fs.writeFileSync('/tmp/e2e-debug.html', html)
  await page.screenshot({ path: '/tmp/e2e-debug.png', fullPage: true })

  console.log('Page URL:', page.url())
  console.log('Page title:', await page.title())
  console.log('HTML saved to /tmp/e2e-debug.html')
  console.log('Screenshot saved to /tmp/e2e-debug.png')
})
