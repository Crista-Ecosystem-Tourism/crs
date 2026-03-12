# 🌍 AI Travel Planner

A beautiful, ChatGPT-style AI travel planning application built with React, TypeScript, and Tailwind CSS.

![AI Travel Planner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800)

## ✨ Features

- **ChatGPT-like Interface** - Conversational AI assistant for trip planning
- **Trip Management** - Create and manage multiple trips
- **Day-by-Day Itineraries** - Detailed planning with activities, restaurants, and events
- **Saved Places** - Keep track of interesting locations
- **Dark Theme** - Beautiful dark mode design inspired by ChatGPT
- **Responsive Design** - Works on desktop and mobile devices
- **Smooth Animations** - Powered by Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
pnpm preview
```

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI primitives (shadcn/ui style)
- **Framer Motion** - Animations
- **React Router** - Routing
- **Lucide Icons** - Beautiful icons

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/           # Chat-related components
│   │   ├── ChatPanel.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── layout/         # Layout components
│   │   ├── AppLayout.tsx
│   │   └── Sidebar.tsx
│   ├── modals/         # Modal dialogs
│   │   ├── NewTripModal.tsx
│   │   ├── AddActivityModal.tsx
│   │   └── SettingsModal.tsx
│   ├── trip/           # Trip detail components
│   │   ├── TripDetailsPanel.tsx
│   │   ├── TripDayList.tsx
│   │   ├── TripItemCard.tsx
│   │   ├── TripOverview.tsx
│   │   └── SavedPlaces.tsx
│   └── ui/             # Reusable UI components (shadcn style)
├── context/            # React Context providers
│   └── AppContext.tsx
├── lib/                # Utility functions
│   └── utils.ts
├── mocks/              # Mock data
│   ├── trips.ts
│   ├── chat.ts
│   ├── places.ts
│   └── user.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🎯 Mock Data

The app includes realistic mock data for testing:

### Trips

1. **Weekend in Paris** 🇫🇷
   - 3 days of romantic getaway
   - Art, culture, and gastronomy
   
2. **Tokyo & Kyoto 7 days** 🇯🇵
   - Week-long Japan adventure
   - Modern Tokyo + traditional Kyoto
   
3. **Bali Remote Work Retreat** 🇮🇩
   - 10-day digital nomad experience
   - Coworking, yoga, and beaches

Each trip includes:
- Day-by-day itinerary
- Activities, restaurants, and transport
- Pre-filled chat history with AI

## 🧪 What You Can Test

### Core Flows

1. **Browse Trips**
   - Click on different trips in the sidebar
   - See trip details update in real-time

2. **Chat with AI**
   - Type messages in the chat input
   - Get mock AI responses after ~1-2 seconds
   - Watch typing indicator animation

3. **View Itinerary**
   - Switch to "Itinerary" tab in right panel
   - See day-by-day activities
   - Click "+" to add new activities

4. **Create New Trip**
   - Click "New Trip" button in sidebar
   - Fill in the form
   - See new trip appear with welcome message

5. **Explore Places**
   - Check "Places" tab for saved locations
   - See ratings and descriptions

### Responsive Design

- Resize browser to see mobile layout
- Sidebar becomes a slide-out menu
- Right panel can be toggled

## 🎨 Design System

### Colors (Dark Theme)

- Background: `#0d0d0d`
- Surface: `#171717`
- Primary (Green): `#10a37f`
- Accent (Purple): `#ab68ff`
- Text: `#ececec`
- Muted: `#9b9b9b`

### Typography

- Font: Inter (Google Fonts)
- Clean, readable text hierarchy

## 📝 API Simulation

The app simulates API calls with:

- **Message sending**: 1-2 second delay before AI response
- **Context-aware responses**: AI responds based on keywords
- **Typing indicator**: Shows "AI is thinking..." animation

## 🔮 Future Improvements

- [ ] Persist data in localStorage
- [ ] Real AI integration (OpenAI API)
- [ ] Map integration for places
- [ ] Sharing and collaboration
- [ ] Export trip to PDF
- [ ] Calendar sync

## 📄 License

MIT License - feel free to use for your projects!

---

Built with ❤️ using React + TypeScript + Tailwind CSS

