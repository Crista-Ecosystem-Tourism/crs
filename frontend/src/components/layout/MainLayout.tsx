import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Compass } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileTabBar } from './MobileTabBar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ChatListPanel } from '@/components/chat/ChatListPanel'
import { TravelMap } from '@/components/map/TravelMap'
import { PlaceDetailPanel } from '@/components/map/PlaceDetailPanel'
import { InspirationBoard } from '@/components/home/InspirationBoard'
import { SavedRoutesPanel } from '@/components/routes/SavedRoutesPanel'
import { DataPanel } from '@/components/data/DataPanel'
import { SuitcasePanel } from '@/components/suitcase/SuitcasePanel'
import { HomeInput } from '@/components/home/HomeInput'
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
    <div className="h-screen w-screen overflow-hidden bg-background text-text font-sans selection:bg-primary/30">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-60 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-background to-background opacity-60 pointer-events-none" />

      {/* Sidebar */}
      <div className="flex h-full relative z-10">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 relative h-full min-w-0">
          <AnimatePresence mode="wait">
            {isHome && mainView === 'chatList' ? (
              <motion.div
                key="chat-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ChatListPanel onBack={() => setMainView('home')} />
              </motion.div>
            ) : isHome && mainView === 'inspiration' ? (
              <motion.div
                key="inspiration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="text-center max-w-md px-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-text mb-3">Вдохновение</h2>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    В следующей версии мы будем автоматически предлагать маршруты на основе ваших предпочтений и истории путешествий.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                    <Compass className="w-4 h-4" />
                    <span>Скоро — персональные рекомендации</span>
                  </div>
                  <button
                    onClick={() => setMainView('home')}
                    className="mt-6 px-4 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    Вернуться на главную
                  </button>
                </div>
              </motion.div>
            ) : isHome && mainView === 'data' ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <DataPanel onBack={() => setMainView('home')} />
              </motion.div>
            ) : isHome && mainView === 'saved' ? (
              <motion.div
                key="saved-routes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SavedRoutesPanel onBack={() => setMainView('home')} />
              </motion.div>
            ) : isHome && mainView === 'suitcase' ? (
              <motion.div
                key="suitcase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SuitcasePanel onBack={() => setMainView('home')} />
              </motion.div>
            ) : isHome ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="w-full h-full relative z-0"
              >
                <InspirationBoard onSelect={(place) => handleHomeInput(`Хочу посетить ${place}`)} />
                <HomeInput onSend={handleHomeInput} />
              </motion.div>
            ) : (
              <motion.div
                key="chat-layout"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="w-full h-full"
              >
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
                    <div className="w-[45%] h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl ring-1 ring-inset ring-white/10" />
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
                    <div className="flex-1 h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-3xl ring-1 ring-inset ring-white/10" />
                      <TravelMap />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AuthModal />
      <SubscriptionModal />
      <PaymentModal />
      <SaveRouteModal />
    </div>
  )
}
