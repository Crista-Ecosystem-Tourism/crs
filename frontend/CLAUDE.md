# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev           # Start dev server at http://localhost:5173
npm run build         # TypeScript check + Vite production build
npm run preview       # Preview production build
npm run lint          # ESLint 9 (flat config, eslint.config.js), zero warnings allowed
npm test              # Vitest unit/component suite
npm run test:e2e      # Playwright browser smoke against stubbed APIs (e2e/)
npm run test:e2e:live # Playwright against a running live stack (e2e-live/)
```

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** (strict mode, no `any`)
- **Vite** for bundling, **Vitest** + Testing Library, **Playwright** for e2e
- **Tailwind CSS** (dark theme default, `darkMode: 'class'`)
- **shadcn/ui** pattern (Radix UI primitives with CVA variants)
- **Framer Motion** for animations
- **React Router v6** for routing
- **Leaflet + React Leaflet** for maps
- **Three.js + React Three Fiber** for 3D elements

## Live API vs mock mode

The app talks to real backends. `VITE_USE_MOCKS=true` (see `isMockMode()` in
`src/api/chatApi.ts`) switches to `src/mocks/` demo data; it is off by default.
A network failure must never fall back to mock data in live mode, and payment or
photo stubs must not imitate success.

| Client (`src/api/`) | Backend | nginx prefix |
|---|---|---|
| `chatApi`, `authApi`, `gameApi`, `wikiApi`, `commerceApi`, `priceApi`, `socialApi`, `tipApi`, `mediaApi`, `starRouteApi` | `ai_agent` | `/api/` |
| `suitcaseApi` | `suitcase` backend | `/suitcase-api/`, `/public-mini-site/` |
| `graphApi` | `placesweb_backend` | `/graph-api/` |
| `travelDataApi` | `data_backend` | `/data-api/` |

Local env: `VITE_API_URL`, `VITE_SUITCASE_API_URL`, `VITE_USE_MOCKS` (`.env.example`).
Server-owned state (XP, energy, stamps, quest prerequisites, entitlements,
publication) is decided by the API; the UI only renders it.

Some screens still read demo catalogs from `src/mocks/` (world map, home hub,
travel passport, daily quiz, `useGameProgress`). Treat them as pending migration
to the API, not as the pattern for new code.

## Architecture

### State Management
Single React Context (`src/context/AppContext.tsx`) manages global state: theme,
interface language (`ru` | `en`), auth session and subscription status, chat
sessions and history, map places, modals and sidebar state. Access via `useApp()`.

### Routing
- `/t/:slug` → public trip mini-site, `/r/:routeId` → public star route,
  `/w/:slug` → public Wiki article (published content only, otherwise noindex/404)
- `/login`, `/signup` → auth forms
- `/profile`, `/settings`, `/support`
- `/*` → MainLayout (home, chat, game, data, community, suitcase panels)

### Component Organization
`src/components/<area>/` by feature: `auth`, `chat`, `community`, `data` (Wiki and
editor queues), `game` (Moscow path, quests, boss, sandbox, onboarding), `home`,
`map`, `modals`, `profile`, `routes`, `settings`, `suitcase`, `trips`, `ui`
(shadcn-style primitives), and others.

### Localization
UI copy lives in `src/lib/*Copy.ts` (`getGameCopy(language)` etc.), with Russian
and English branches. New user-facing text needs both; API calls that return
content pass the selected language, and the server reports the language served.

## Key Patterns

**UI Components (shadcn/ui style):**
```typescript
const buttonVariants = cva('base-classes', {
  variants: { variant: {...}, size: {...} }
})
```

**Class Merging:** Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)

**Animations:** Framer Motion with `AnimatePresence` for mount/unmount animations

**Effects that fetch:** guard with an `active` flag in cleanup and keep
dependency arrays complete; lint enforces `react-hooks/exhaustive-deps`.

## Conventions

- Named exports for all components
- Pure functional components with hooks
- CSS variables for colors: `var(--color-*)`
- Coordinates: `[latitude, longitude]` tuple

## Don'ts

- No new UI libraries (MUI, Chakra, etc.)
- No state managers (Redux, Zustand, MobX)
- No backend code here; backends live in sibling repositories
- No JavaScript source files - TypeScript only (.tsx/.ts)
