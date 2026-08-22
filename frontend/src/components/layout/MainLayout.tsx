import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { AppFrame } from './AppFrame'
import { MobileTabBar } from './MobileTabBar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ChatListPanel } from '@/components/chat/ChatListPanel'
import { TravelMap } from '@/components/map/TravelMap'
import { PlaceDetailPanel } from '@/components/map/PlaceDetailPanel'
import { HomeHub } from '@/components/home/HomeHub'
import { SavedRoutesPanel } from '@/components/routes/SavedRoutesPanel'
import { DataPanel } from '@/components/data/DataPanel'
import { MyTripsPanel } from '@/components/trips/MyTripsPanel'
import { InspirationPanel } from '@/components/inspiration/InspirationPanel'
import { CommunityPanel } from '@/components/community/CommunityPanel'
import { GamePanel } from '@/components/game/GamePanel'
import { PlaceByPhotoPanel } from '@/components/place/PlaceByPhotoPanel'
import { ToursGlampingPanel } from '@/components/tours/ToursGlampingPanel'
import { AuthModal } from '@/components/modals/AuthModal'
import { SubscriptionModal } from '@/components/modals/SubscriptionModal'
import { PaymentModal } from '@/components/modals/PaymentModal'
import { SaveRouteModal } from '@/components/modals/SaveRouteModal'
import { useApp } from '@/context/AppContext'
import { useMediaBreakpoint } from '@/hooks/useMediaBreakpoint'
import { useResizableSplit } from '@/hooks/useResizableSplit'

export function MainLayout() {
  const { currentChatId, newChat, sendMessage, mobileActiveTab, selectedPlace, setSelectedPlace, mainView, setMainView } = useApp()
  const breakpoint = useMediaBreakpoint()
  const { ratio, isDragging, handleMouseDown, handleDoubleClick, containerRef } = useResizableSplit({
    minLeftPx: 320,
    minRightPx: 300,
    defaultRatio: 0.4,
    storageKey: 'chat-map-split-ratio',
  })

  const handleHomeInput = async (text: string) => {
    newChat()
    setTimeout(() => {
      sendMessage(text)
    }, 100)
  }

  const isHome = !currentChatId

  return (
    <div className="h-screen w-screen overflow-hidden text-text font-sans selection:bg-primary/30">

      <AppFrame>
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 relative h-full min-w-0">
            {isHome && mainView === 'chatList' ? (
              <div className="w-full h-full crista-view">
                <ChatListPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'inspiration' ? (
              <div className="w-full h-full crista-view">
                <InspirationPanel onBack={() => setMainView('saved')} />
              </div>
            ) : isHome && mainView === 'data' ? (
              <div className="w-full h-full crista-view">
                <DataPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'game' ? (
              <div className="w-full h-full crista-view">
                <GamePanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'community' ? (
              <div className="w-full h-full crista-view">
                <CommunityPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'placeByPhoto' ? (
              <div className="w-full h-full crista-view">
                <PlaceByPhotoPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'toursGlamping' ? (
              <div className="w-full h-full crista-view">
                <ToursGlampingPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'saved' ? (
              <div className="w-full h-full crista-view">
                <SavedRoutesPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome && mainView === 'suitcase' ? (
              <div className="w-full h-full crista-view">
                <MyTripsPanel onBack={() => setMainView('home')} />
              </div>
            ) : isHome ? (
<div className="w-full h-full relative z-0 crista-view">
                <HomeHub onSend={handleHomeInput} />
              </div>
            ) : (
<div className="w-full h-full crista-view">
                {/* Mobile layout */}
                {breakpoint === 'mobile' && (
                  <div className="flex flex-col w-full h-full">
                    {/* Content area */}
                    <div className="relative flex-1 min-h-0">
                      {/* Chat */}
                      <motion.div
                        animate={{
                          opacity: mobileActiveTab === 'chat' ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                        style={{ pointerEvents: mobileActiveTab === 'chat' ? 'auto' : 'none' }}
                      >
                        <ChatPanel />
                      </motion.div>

                      {/* Map */}
                      <motion.div
                        animate={{
                          opacity: mobileActiveTab === 'map' ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                        style={{ pointerEvents: mobileActiveTab === 'map' ? 'auto' : 'none' }}
                      >
                        <TravelMap />
                      </motion.div>

                      {/* Mobile PlaceDetailPanel */}
                      <AnimatePresence>
                        {selectedPlace && (
                          <PlaceDetailPanel
                            place={selectedPlace}
                            onClose={() => setSelectedPlace(null)}
                            breakpoint="mobile"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tab bar — part of flex flow, not floating */}
                    <MobileTabBar />
                  </div>
                )}

                {/* Tablet layout */}
                {breakpoint === 'tablet' && (
                  <div className="flex w-full h-full p-2 gap-2">
                    <div className="w-[55%] h-full flex-shrink-0 flex flex-col">
                      <ChatPanel />
                    </div>
                    <div className="w-[45%] h-full relative rounded-2xl overflow-hidden border border-hairline shadow-2xl">
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl ring-1 ring-inset ring-hairline" />
                      <TravelMap />
                    </div>
                  </div>
                )}

                {/* Desktop layout */}
                {breakpoint === 'desktop' && (
                  <div ref={containerRef} className="flex w-full h-full p-4 gap-0">
                    {/* Chat Panel */}
                    <div
                      className="h-full flex-shrink-0 flex flex-col pr-0"
                      style={{ width: `${ratio * 100}%` }}
                    >
                      <ChatPanel />
                    </div>

                    {/* Draggable divider */}
                    <div
                      className="relative flex-shrink-0 z-20 flex items-center justify-center group"
                      style={{ width: '12px' }}
                    >
                      <div
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        onDoubleClick={handleDoubleClick}
                        className={`absolute inset-y-0 w-3 cursor-col-resize flex items-center justify-center
                          ${isDragging ? 'bg-primary/10' : ''}`}
                      >
                        <div
                          className={`w-[3px] h-12 rounded-full transition-colors
                            ${isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/60'}`}
                        />
                      </div>
                    </div>

                    {/* Map */}
                    <div className="flex-1 h-full relative rounded-3xl overflow-hidden border border-hairline shadow-2xl">
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-3xl ring-1 ring-inset ring-hairline" />
                      <TravelMap />
                    </div>
                  </div>
                )}
              </div>
            )}
        </main>
      </AppFrame>

      {/* Modals */}
      <AuthModal />
      <SubscriptionModal />
      <PaymentModal />
      <SaveRouteModal />
    </div>
  )
}
