# AGENTS.md — TRAKKA Development Guide

> Instructions for AI coding assistants and developers working on the TRAKKA codebase.

## Quick Start

```bash
cd ~/projects/trakka-app
npm install
npm run dev
```

Open `http://localhost:5173`

## Project Structure

```
trakka-app/
├── src/
│   ├── components/ui/      # Reusable UI components
│   │   ├── NavRail.jsx     # Left navigation rail
│   │   ├── TopBar.jsx      # Top status bar
│   │   ├── StatusPill.jsx  # Semantic status badges
│   │   └── SectionTitle.jsx # Section header pattern
│   ├── pages/
│   │   ├── Login.jsx       # Auth gate (Google OAuth)
│   │   └── Dashboard.jsx   # Main dashboard shell + views
│   ├── data/
│   │   └── seedTrip.js     # AU test data (Jervis Bay scenario)
│   ├── lib/
│   │   ├── supabase.js     # Supabase client + auth helpers
│   │   └── utils.js        # cn(), formatters
│   ├── types/
│   │   └── index.js        # JSDoc type definitions
│   ├── index.css           # Tailwind v4 + TRAKKA design tokens
│   ├── App.jsx             # Root component (auth routing)
│   └── main.jsx            # Entry point
├── .env.example            # Required env vars
└── PROJECT_TRACKER.md      # Current status & roadmap
```

## Design System (Read Before Changing UI)

All tokens are CSS custom properties in `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `bg-bg-base` | `#0A0C10` | Page background |
| `bg-bg-surface` | `#161B22` | Cards, panels |
| `bg-bg-panel` | `#0d1117` | Nav rail, elevated panels |
| `border-border-default` | `#30363D` | All borders |
| `text-text-primary` | `#C9D1D9` | Headings, body |
| `text-text-secondary` | `#8B949E` | Metadata, labels |
| `info` | `#58A6FF` | Blue — default accent |
| `warning` | `#D29922` | Amber — pending, transit |
| `success` | `#3FB950` | Green — go, settled, done |
| `critical` | `#F85149` | Red — critical, issue, blocked |

### Typography Rules
- Eyebrows: `9px`, `font-black`, `uppercase`, `tracking-[0.2em]`, `text-info`
- Headers: `13-14px`, `font-black`, `uppercase`, `tracking-[0.12em]`
- Body: `11-12px`, `font-bold` or `font-medium`
- Metadata: `10px`, `font-bold`, `text-text-secondary`
- Data/numbers: Use `font-mono` (Geist Mono) for alignment

### Component Patterns
- All panels: `border border-border-default bg-bg-surface`
- Active state: `border-info bg-bg-elevated/60`
- Hover state: `hover:border-info/40 hover:bg-bg-elevated/40`
- Buttons: `border` + `bg-bg-panel` + `uppercase` + `tracking-wider`
- No rounded corners larger than `4px` (`rounded-[2px]` or `rounded-[4px]`)

## Auth Flow

1. User hits `/` → App.jsx checks session
2. No session → render `<Login />`
3. Click "Sign in with Google" → `signInWithGoogle()` → redirect to Google
4. Callback at `/auth/callback` (needs route handler)
5. Session established → render `<Dashboard />`

**Important:** The auth callback route is NOT yet implemented. Add a router (React Router) or handle the callback in App.jsx.

## State Management (Current)

All state is local React state in `Dashboard.jsx`. No global state library yet.

```javascript
const [activePage, setActivePage] = useState('families')
const [activeFamily, setActiveFamily] = useState('sydney-crew')
const [searchQuery, setSearchQuery] = useState('')
```

Future: Consider Zustand or Jotai when state grows beyond 5-6 top-level atoms.

## Adding a New Dashboard View

1. Create the view component in `src/pages/Dashboard.jsx` (or split into `src/pages/views/`)
2. Add nav item to `NavRail.jsx` if it's a top-level section
3. Add case to `renderPage()` switch in `Dashboard.jsx`
4. Add seed data to `src/data/seedTrip.js` if needed

## API Keys & Environment Variables

| Variable | Source | Status |
|----------|--------|--------|
| `VITE_SUPABASE_URL` | Supabase project settings | ❌ Not set |
| `VITE_SUPABASE_ANON_KEY` | Supabase project settings | ❌ Not set |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox account | ❌ Not set |
| `VITE_BOM_API_KEY` | User provided | ✅ Set in Vercel |

**To add to Vercel:**
```bash
vercel env add <KEY> production
```

## Testing

No test suite yet. Add with Vitest:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Deployment

```bash
# Auto-deploy on push to master
git push origin master

# Manual deploy
vercel --prod
```

## Common Pitfalls

1. **Don't use `window` or `document` in SSR contexts** — Vite doesn't SSR by default, but be careful if we add it later.
2. **Mapbox token must be VITE-prefixed** to be available in client code.
3. **Supabase auth in Vercel** needs the callback URL configured in Supabase Dashboard.
4. **Don't commit `.env`** — it's in `.gitignore`, but double-check.
5. **Tailwind v4 uses `@theme`** not `tailwind.config.js` — tokens go in `src/index.css`.

## Questions?

Check `PROJECT_TRACKER.md` for current status and roadmap.  
Check `~/projects/oz-trip-commander/docs/` for original architecture analysis.
