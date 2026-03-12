# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build
npm run lint     # ESLint with strict zero-warning policy
```

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** (strict mode, no `any`)
- **Vite** for bundling
- **Tailwind CSS** (dark theme default, `darkMode: 'class'`)
- **shadcn/ui** pattern (Radix UI primitives with CVA variants)
- **Framer Motion** for animations
- **React Router v6** for routing
- **Leaflet + React Leaflet** for maps
- **Three.js + React Three Fiber** for 3D elements

## Architecture

### State Management
Single React Context (`src/context/AppContext.tsx`) manages all global state:
- Theme (light/dark with localStorage persistence)
- User authentication & subscription status
- Chat messages, typing state, chat history
- Map places and selection
- Modal state (auth, subscription, payment)
- Sidebar UI state

Access via `useApp()` hook.

### Routing
- `/login` → LoginForm
- `/signup` → RegisterForm
- `/*` → MainLayout (home or chat view based on `currentChatId`)

### Component Organization
```
src/components/
├── auth/      # LoginForm, RegisterForm, AuthLayout
├── canvas/    # 3D components (PixelPlanet)
├── chat/      # ChatPanel, ChatMessage, ChatInput, PlaceCard, PlacesGrid
├── home/      # HomeInput, InspirationBoard
├── layout/    # MainLayout, Sidebar
├── map/       # TravelMap, PlaceDetailPanel
├── modals/    # AuthModal, SubscriptionModal, PaymentModal
└── ui/        # shadcn/ui components (Button, Input, Dialog, etc.)
```

### Key Patterns

**UI Components (shadcn/ui style):**
```typescript
const buttonVariants = cva('base-classes', {
  variants: { variant: {...}, size: {...} }
})
```

**Class Merging:** Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)

**Animations:** Framer Motion with `AnimatePresence` for mount/unmount animations

**Mock Data:** All API calls simulated via `src/mocks/` with `delay()` utility

### Domain Types (src/types/index.ts)
- `Place` - map locations with coordinates
- `ChatMessage` - chat messages with optional places
- `User` - user profile with auth/subscription state
- `ChatHistoryItem` - saved chat sessions
- `ModalType` - 'auth' | 'subscription' | 'payment' | 'save-route' | null

### Auth Flow
States: `guest` → `registered` → `subscribed`
- Guest chat triggers auth modal after delay
- Place selection/route saving requires subscription

## Conventions

- Named exports for all components
- Pure functional components with hooks
- CSS variables for colors: `var(--color-*)`
- ID format: `timestamp-randomString`
- Coordinates: `[latitude, longitude]` tuple
- All text in Russian (UI is fully localized)

## Don'ts

- No new UI libraries (MUI, Chakra, etc.)
- No state managers (Redux, Zustand, MobX)
- No backend code - frontend only with mocks
- No JavaScript files - TypeScript only (.tsx/.ts)
