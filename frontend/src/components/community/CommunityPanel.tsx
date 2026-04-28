import { ArrowLeft, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CommunityPanelProps = {
  onBack: () => void
}

export function CommunityPanel({ onBack }: CommunityPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-xl font-bold text-text">Сообщество</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-surface-light/80 p-1 rounded-xl border border-border/50">
            <TabsTrigger
              value="routes"
              className="rounded-lg px-4 py-2 text-left whitespace-normal md:whitespace-nowrap flex-1 min-w-[min(100%,14rem)]"
            >
              Маршруты блогеров, звёзд и друзей
            </TabsTrigger>
          </TabsList>
          <TabsContent value="routes" className="mt-6 outline-none">
            <div className="rounded-2xl border border-border bg-surface-light/40 p-8 text-center max-w-lg mx-auto">
              <Users className="w-12 h-12 text-primary/60 mx-auto mb-4" />
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                Здесь появится лента чужих маршрутов: избранные места популярных авторов и приглашённых друзей.
              </p>
              <p className="text-text-muted text-xs mt-4">Раздел в разработке</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
