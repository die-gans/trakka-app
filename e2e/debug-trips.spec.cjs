const { test, expect } = require('@playwright/test')
const fs = require('fs')

const SESSION = JSON.parse(fs.readFileSync('/tmp/trakka_session.json', 'utf8'))
const AUTH_KEY = 'sb-127-auth-token'

test('debug trips page', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
  }, { key: AUTH_KEY, session: SESSION })

  await page.goto('http://localhost:5173/trips')
  await page.waitForTimeout(2000)

  const html = await page.content()
  fs.writeFileSync('/tmp/e2e-debug.html', html)
  await page.screenshot({ path: '/tmp/e2e-debug.png', fullPage: true })

  console.log('Page URL:', page.url())
  console.log('Page title:', await page.title())
  console.log('HTML saved to /tmp/e2e-debug.html')
  console.log('Screenshot saved to /tmp/e2e-debug.png')
})
