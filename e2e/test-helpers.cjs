const fs = require('fs')
const path = require('path')

const SESSION_FILE = path.join(__dirname, '..', '.e2e-session.json')
const AUTH_KEY = 'sb-127-auth-token'

/**
 * Inject a saved Supabase session into the page's localStorage.
 * Call this before navigating to any authenticated page.
 */
async function injectSession(page) {
  if (!fs.existsSync(SESSION_FILE)) {
    throw new Error(`E2E session file not found: ${SESSION_FILE}. Run global setup first.`)
  }

  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'))

  await page.goto('http://localhost:5173/login')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
  }, { key: AUTH_KEY, session })
}

module.exports = { injectSession }
