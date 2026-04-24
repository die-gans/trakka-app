# TRAKKA — Project Tracker

> **Live URL:** https://trakka-app.vercel.app  
> **Repo:** https://github.com/die-gans/trakka-app  
> **Last Updated:** 2026-04-24  
> **Current Status:** v0.1 Scaffold Complete — Ready for Feature Development

---

## 🏗️ Architecture Overview

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| UI Components | Custom (NavRail, TopBar, StatusPill, SectionTitle) |
| Maps | Mapbox GL JS (installed, not yet integrated) |
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
- [x] Environment variable: `VITE_BOM_API_KEY`

### UI Shell
- [x] Palantir-style dark dashboard shell
- [x] Left nav rail with 6 sections
- [x] Top bar with classification banner + family switcher + search
- [x] Inspector rail panel (responsive, hidden on < xl)
- [x] StatusPill component (semantic colors)
- [x] SectionTitle component (eyebrow + title + meta pattern)

### Auth
- [x] Supabase client configured
- [x] Google OAuth sign-in flow
- [x] Login screen ("Roll Out" branding)
- [x] Auth state management in App.jsx
- [x] Logout capability (add to settings later)

### Seed Data (AU Focused)
- [x] Jervis Bay long weekend scenario
- [x] 3 family units (Sydney, Melbourne, Canberra crews)
- [x] Routes, meals, expenses, tasks seeded
- [x] 4-day itinerary structure

### Working Views
- [x] **Families/Units:** Readiness scores, checklists, responsibilities, status
- [x] **Meals:** Meal plan with owner + status
- [x] **Tasks:** Task board with open/done states
- [x] **Itinerary:** 4-day timeline grid (placeholder slots)

---

## 🚧 In Progress

*Nothing actively in progress. Pick your next ticket from Planned.*

---

## 📋 Planned — v0.1 (Next 4-6 Weeks)

### High Priority
- [ ] **Supabase Project Setup**
  - Create Supabase project
  - Configure Google Auth provider
  - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel env vars
  - Create database schema (trips, families, locations, routes, etc.)
  - Set up Row Level Security policies

- [ ] **Mapbox Integration**
  - Add Mapbox GL map to dashboard
  - Dark map styling matching TRAKKA palette
  - Render route lines for each family
  - Location markers for waypoints/basecamp
  - Route simulation playback

- [ ] **CRUD Operations**
  - Make itinerary editable (add/move/delete items)
  - Make meals editable
  - Make tasks toggleable (done/open)
  - Make checklists interactive

- [ ] **BOM Weather Integration**
  - Fetch live weather for trip locations
  - Display daily weather in itinerary
  - Fire danger rating (seasonal)
  - UV index display
  - Fallback to seeded data on API failure

### Medium Priority
- [ ] **PWA Setup**
  - Web App Manifest
  - Service worker (basic caching)
  - Install prompt handling
  - Mobile viewport optimization

- [ ] **Checkpoint System (Mobile)**
  - "Departed" / "Arrived" / "Stopped" quick actions
  - Geolocation API for foreground tracking
  - Manual checkpoint logging
  - Display checkpoints on dashboard

- [ ] **Expense Split Logic**
  - Equal / Manual / Individual allocation modes
  - Family burden calculation
  - Settle up tracking

- [ ] **Family Group Chat**
  - Simple message thread per trip
  - Supabase realtime subscriptions

### Low Priority (v0.2)
- [ ] **Trip Creation Flow**
  - Form to create new trips
  - Add/remove family units
  - Set basecamp location

- [ ] **Search**
  - Cross-entity search (families, locations, meals, tasks)
  - Search results dropdown

- [ ] **Export**
  - JSON export of trip state
  - PDF itinerary generation

- [ ] **Responsive Polish**
  - Mobile nav (bottom sheet or hamburger)
  - Tablet layout optimizations
  - Touch-friendly controls

---

## 🗺️ Roadmap — Beyond v0.1

| Version | Focus | Features |
|---------|-------|----------|
| **v0.2** | Real-time + Mobile | Live ops dashboard, family chat, push notifications, trip creation |
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

---

## 🐛 Known Issues

1. **Login page flashes before auth check completes** — add a loading skeleton
2. **No error handling for auth failures** — need toast/alert system
3. **Inspector rail is empty** — needs entity selection logic
4. **Timeline grid is static** — no drag-to-resize or edit capability
5. **Mobile viewport untested** — dashboard is desktop-optimized only
6. **BOM API key exposed client-side** — `VITE_` prefix required for Vite, but key is low-risk public weather data

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

**Next recommended ticket:** Supabase project setup + database schema. Without this, nothing persists.

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
