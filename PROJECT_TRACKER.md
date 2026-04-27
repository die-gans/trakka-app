# TRAKKA — Project Tracker

> **Live URL:** https://trakka-app.vercel.app  
> **Repo:** https://github.com/die-gans/trakka-app  
> **Last Updated:** 2026-04-27  
> **Current Status:** v0.1 Active — Backend live, auth working, core features shipping

---

## 🏗️ Architecture Overview

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| UI Components | Custom (NavRail, TopBar, StatusPill, SectionTitle) |
| Maps | Mapbox GL JS ✅ dark styling, route lines, cursor-synced convoy, camera follow, zoom/compass controls |
| Animation | Framer Motion (installed, minimal use) |
| Icons | Lucide React |
| Auth | Supabase Auth (Google OAuth) |
| Backend | Supabase (Postgres + Realtime API) |
| Weather | BOM (Bureau of Meteorology) — API key configured |
| Deployment | Vercel (auto-deploy on push to master) |

---

## ✅ Done

### Foundation
- [x] React 19 + Vite scaffold
- [x] Tailwind CSS v4 with custom TRAKKA design tokens
- [x] Project structure (components, lib, pages, data, types)
- [x] Git repo initialized + pushed to GitHub
- [x] Vercel deployment pipeline live
- [x] Environment variable: `VITE_BOM_API_KEY` (production), `VITE_SUPABASE_*` (all envs)

### UI Shell
- [x] Palantir-style dark dashboard shell
- [x] Left nav rail with 6 sections
- [x] Top bar with classification banner + family switcher + search
- [x] Inspector rail panel (responsive, hidden on < xl)
- [x] StatusPill component (semantic colors)
- [x] SectionTitle component (eyebrow + title + meta pattern)
- [x] **Bug fix:** Tailwind v4 `--spacing-*` @theme vars were collapsing all `max-w-*` to px values — removed unused vars, restored correct sizing

### Auth
- [x] Supabase client configured + project live (`eusciubephumojrscdgk`, ap-southeast-2)
- [x] Google OAuth configured (client ID set, localhost + production redirect URIs)
- [x] Anonymous auth for local dev bypass — real JWT, RLS works, no Google login required
- [x] Login screen ("Roll Out" branding)
- [x] Auth state management (AuthContext)
- [x] Protected routes with loading state

### Backend / Database
- [x] Supabase project live and healthy
- [x] Full schema deployed (13 tables: trips, families, users, trip_members, meals, tasks, expenses, locations, routes, itinerary_items, checkpoints, messages, checklist_items)
- [x] Row Level Security policies (viewer/editor roles)
- [x] `handle_new_user` trigger — auto-creates public.users on auth signup
- [x] `settled` + `updated_at` columns added to expenses (migration applied)
- [x] Vercel env vars set for all environments

### Working Views
- [x] **Trips list:** Create trip (3-step form), list existing trips with status badge
- [x] **Families/Units:** Readiness scores, checklists, responsibilities, status
- [x] **Meals:** Meal plan with owner + status toggle + CRUD
- [x] **Tasks:** Task board with open/done/blocked states + CRUD
- [x] **Itinerary:** 4-day timeline grid with add/delete items + CRUD + playback scrubber + cursor line
- [x] **Expenses:** List with CRUD, family name display, settle/unsettle toggle, settle-up net balance panel

### Playback & Briefing
- [x] **Timeline playback** — play/pause/restart/speed controls with rAF animation loop
- [x] **Cursor-driven timeline** — scrubber bar, vertical cursor line, item dimming (past/current/future)
- [x] **Mission Launch modal** — dramatic per-day countdown overlay with themed colors (amber/blue/red/green)
- [x] **Operation checkpoints** — playback pauses at first activity of each day, triggers Mission Launch
- [x] **Daily Briefing modal** — full-screen situational awareness per day: summary, lookouts, stats, meals, tasks
- [x] **Map cursor sync** — routes highlight/dim based on active cursor day

### Weather
- [x] WeatherWidget complete (current conditions, 5-day forecast, fire danger rating)
- [x] Wired to trip's `basecamp_lat/lng` (was hardcoded to Jervis Bay)
- [x] Live in production (API key set in Vercel)
- [x] Graceful fallback when API key missing locally

---

## 🚧 In Progress

*Nothing actively in progress. Pick your next ticket from Planned.*

---

## 📋 Planned — v0.1 (Next)

### High Priority
- [x] **Mapbox Integration**
  - Add Mapbox GL map to dashboard ✅
  - Dark map styling matching TRAKKA palette ✅
  - Render route lines for each family unit ✅
  - Location markers for waypoints/basecamp ✅
  - Cursor-synced convoy playback ✅
  - Camera follow mode during playback ✅
  - Map controls (zoom, compass, fullscreen) ✅

- [ ] **Drive plan per family**
  - Stop-by-stop breakdown with ETAs
  - Pairs with map — families tab shows departure + stops
  - Route lines now live on map view

- [x] **Daily briefing / situation board** ✅
  - Full-screen modal per day with mission code, tone, summary, lookouts
  - Stats: live items, meals, open tasks
  - Clickable itinerary, meals, and tasks within briefing
  - Positions TRAKKA as a command centre

### Medium Priority
- [ ] **Expense split — manual + individual modes**
  - Equal split ✅ done; manual per-family allocation UI still needed
  - `allocations` JSONB field ready in schema

- [ ] **Checkpoint System (Mobile)**
  - "Departed" / "Arrived" / "Stopped" quick actions
  - Geolocation API for foreground tracking
  - Display checkpoints on dashboard map

- [ ] **Family Group Chat**
  - Simple message thread per trip
  - Supabase realtime subscriptions
  - `messages` table already in schema

- [ ] **PWA Setup**
  - Web App Manifest + service worker
  - Install prompt handling
  - Mobile viewport polish (bottom nav, touch controls)

### Low Priority (v0.2)
- [ ] **Search** — cross-entity (families, locations, meals, tasks); UI stub exists

- [ ] **Export** — JSON/PDF itinerary

- [x] ~~Activities view~~ — folded into Itinerary nav ✅

- [x] ~~Stay view~~ — folded into Itinerary nav ✅

---

## 🗺️ Roadmap — Beyond v0.1

| Version | Focus | Features |
|---------|-------|----------|
| **v0.2** | Real-time + Mobile | Live ops dashboard, family chat, push notifications, checkpoint system |
| **v0.3** | Camping Module | Gear inventory, campsite intel, track conditions, fire bans, Leave No Trace checklists |
| **v0.4** | Advanced Coordination | AI trip suggestions, automated ETAs, traffic integration, emergency beacon support |
| **v0.5** | Commercialization | Payment processing, subscription tiers, team/organizer accounts, white-label option |

---

## 🔧 Developer Setup

```bash
# Clone
git clone https://github.com/die-gans/trakka-app.git
cd trakka-app

# Install
npm install

# Env vars
cp .env.example .env
# Add your Supabase and Mapbox credentials

# Dev server
npm run dev

# Build
npm run build

# Deploy (auto on push to master via Vercel)
vercel --prod
```

---

## 📝 Design Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-24 | Google OAuth for auth | Persistent identity, low friction, Supabase native support |
| 2026-04-24 | PWA first, React Native later | Faster to ship, same codebase, evaluate need before native investment |
| 2026-04-24 | Checkpointing over background GPS | iOS restricts background web apps; intentional check-ins are more reliable |
| 2026-04-24 | Mapbox over Google Maps | Better AU coverage, offline tiles, cheaper at scale, custom dark styling |
| 2026-04-24 | Tailwind v4 | Latest utility-first CSS, CSS-based config, performance |
| 2026-04-24 | Vercel for hosting | Git-integrated, automatic deploys, edge network, free tier generous |
| 2026-04-26 | Anonymous auth for dev bypass | Real Supabase JWT without Google login; RLS works correctly; no fake session hacks |
| 2026-04-26 | `getSession()` not `getUser()` in CRUD | `getUser()` validates JWT server-side on every call — too slow and fragile for client CRUD; RLS enforces auth at DB level |
| 2026-04-27 | Nav consolidation: Activities + Stay → Itinerary | Reduces conceptual duplication. Itinerary is the single source of truth for scheduled events |
| 2026-04-27 | Timeline playback + Mission Launch | Ported from source inspiration. rAF loop with operation checkpoints and dramatic modal overlays |
| 2026-04-27 | Separate hooks over unified trip document | Keeps current architecture simple. All data passed down to Dashboard, context derived at render time |
| 2026-04-26 | Settle-up as net balance per family | Simpler to read than pairwise "A owes B $X" matrix; works for equal split; extend to manual when needed |

---

## 🐛 Known Issues

1. **No error handling for auth failures** — need toast/alert system
2. **Timeline grid is static** — no drag-to-resize; items are add/delete only
8. **Linked entities** — itinerary items can link to meals/locations but UI for creating links is not built yet
3. **Mobile viewport untested** — dashboard is desktop-optimized only
4. **BOM API key exposed client-side** — `VITE_` prefix required for Vite, but key is low-risk public weather data
5. **Expense split — manual/individual modes** — UI accepts the mode but doesn't show per-family allocation fields yet
6. **Trip basecamp coords not collected in CreateTrip form** — weather falls back to Jervis Bay defaults until lat/lng capture is added to the form
7. **Weather unavailable locally** — `VITE_BOM_API_KEY` is production-only; add to Vercel dev env to fix

---

## 🤝 Handoff Notes for Next Agent

**If you're picking this up, start here:**

1. Read `PROJECT_TRACKER.md` (this file) for current status
2. Check `docs/` in `~/projects/oz-trip-commander/` for original analysis and architecture decisions
3. The design system is in `src/index.css` — all TRAKKA tokens are CSS custom properties
4. Seed data is in `src/data/seedTrip.js` — this is your test fixture
5. Components are in `src/components/ui/` — follow the existing pattern (small, functional, Tailwind)
6. Pages are in `src/pages/` — Dashboard.jsx is the main view, Login.jsx is auth
7. Run `npm run dev` to see the current state

**Next recommended ticket:** Linked Entities — connect itinerary items to meals/locations/routes so clicking an itinerary block shows its linked entities in the InspectorRail. This completes the "command centre" data graph.

**Recently shipped:**
- Mapbox integration with dark styling, route lines, cursor-synced convoy, camera follow, map controls
- Timeline playback with cursor, scrubber, Mission Launch checkpoints
- Daily Briefing modal per day
- Nav consolidation (6 clean sections)

**Style guide:**
- 9px font for eyebrows/labels, uppercase, tracking-wider
- 10px for metadata, bold
- 11-12px for body text
- 13-14px for section headers, uppercase, tracking-wide
- Inter for UI, Geist Mono for data
- Semantic colors only: info (blue), warning (amber), success (green), critical (red)
- All panels: `bg-bg-surface` with `border-border-default`

---

## 🔗 Links

- **Live App:** https://trakka-app.vercel.app
- **GitHub Repo:** https://github.com/die-gans/trakka-app
- **Original Analysis:** `~/projects/oz-trip-commander/docs/`
- **Vercel Dashboard:** https://vercel.com/die-gans-projects/trakka-app
