import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'

export interface InspirationItem {
  id: string
  title: string
  location: string
  imageUrl: string
  type: 'nature' | 'city' | 'culture' | 'food'
  height: number
}

// Travel destinations with matching images
const IMG = '/images/inspiration'
const locations = [
  { title: 'Альпы', loc: 'Швейцария', type: 'nature', image: `${IMG}/alps.jpg` },
  { title: 'Озеро Брайес', loc: 'Италия', type: 'nature', image: `${IMG}/braies.jpg` },
  { title: 'Мальдивы', loc: 'Мальдивы', type: 'nature', image: `${IMG}/maldives.jpg` },
  { title: 'Париж', loc: 'Франция', type: 'city', image: `${IMG}/paris.jpg` },
  { title: 'Токио', loc: 'Япония', type: 'city', image: `${IMG}/tokyo.jpg` },
  { title: 'Венеция', loc: 'Италия', type: 'culture', image: `${IMG}/venice.jpg` },
  { title: 'Чинкве-Терре', loc: 'Италия', type: 'nature', image: `${IMG}/cinque-terre.jpg` },
  { title: 'Норвегия', loc: 'Норвегия', type: 'nature', image: `${IMG}/norway.jpg` },
  { title: 'Стамбул', loc: 'Турция', type: 'city', image: `${IMG}/istanbul.jpg` },
  { title: 'Санторини', loc: 'Греция', type: 'city', image: `${IMG}/santorini.jpg` },
  { title: 'Бангкок', loc: 'Таиланд', type: 'food', image: `${IMG}/bangkok.jpg` },
  { title: 'Бали', loc: 'Индонезия', type: 'nature', image: `${IMG}/bali.jpg` },
  { title: 'Амстердам', loc: 'Нидерланды', type: 'culture', image: `${IMG}/amsterdam.jpg` },
  { title: 'Патагония', loc: 'Аргентина', type: 'nature', image: `${IMG}/patagonia.jpg` },
  { title: 'Дубай', loc: 'ОАЭ', type: 'city', image: `${IMG}/dubai.jpg` },
  { title: 'Карибы', loc: 'Карибские о-ва', type: 'nature', image: `${IMG}/caribbean.jpg` },
  { title: 'Новая Зеландия', loc: 'Новая Зеландия', type: 'nature', image: `${IMG}/new-zealand.jpg` },
  { title: 'Прованс', loc: 'Франция', type: 'culture', image: `${IMG}/provence.jpg` },
  { title: 'Киото', loc: 'Япония', type: 'culture', image: `${IMG}/kyoto.jpg` },
  { title: 'Марракеш', loc: 'Марокко', type: 'culture', image: `${IMG}/marrakech.jpg` },
  { title: 'Чикаго', loc: 'США', type: 'city', image: `${IMG}/chicago.jpg` },
  { title: 'Убуд', loc: 'Индонезия', type: 'culture', image: `${IMG}/ubud.jpg` },
  { title: 'Мауи', loc: 'Гавайи', type: 'nature', image: `${IMG}/maui.jpg` },
  { title: 'Сеул', loc: 'Южная Корея', type: 'food', image: `${IMG}/seoul.jpg` },
  { title: 'Кения', loc: 'Кения', type: 'nature', image: `${IMG}/kenya.jpg` },
  { title: 'Исландия', loc: 'Исландия', type: 'nature', image: `${IMG}/iceland.jpg` },
  { title: 'Агра', loc: 'Индия', type: 'culture', image: `${IMG}/agra.jpg` },
  { title: 'Шефшауэн', loc: 'Марокко', type: 'city', image: `${IMG}/chefchaouen.jpg` },
  { title: 'Осака', loc: 'Япония', type: 'culture', image: `${IMG}/osaka.jpg` },
  { title: 'Бавария', loc: 'Германия', type: 'nature', image: `${IMG}/bavaria.jpg` },
  { title: 'Барселона', loc: 'Испания', type: 'city', image: `${IMG}/barcelona.jpg` },
  { title: 'Прага', loc: 'Чехия', type: 'city', image: `${IMG}/prague.jpg` },
  { title: 'Рио-де-Жанейро', loc: 'Бразилия', type: 'nature', image: `${IMG}/rio.jpg` },
  { title: 'Будапешт', loc: 'Венгрия', type: 'culture', image: `${IMG}/budapest.jpg` },
  { title: 'Лиссабон', loc: 'Португалия', type: 'culture', image: `${IMG}/lisbon.jpg` },
  { title: 'Сингапур', loc: 'Сингапур', type: 'city', image: `${IMG}/singapore.jpg` },
  { title: 'Петра', loc: 'Иордания', type: 'culture', image: `${IMG}/petra.jpg` },
  { title: 'Афины', loc: 'Греция', type: 'culture', image: `${IMG}/athens.jpg` },
  { title: 'Мачу-Пикчу', loc: 'Перу', type: 'culture', image: `${IMG}/machu-picchu.jpg` },
  { title: 'Вена', loc: 'Австрия', type: 'culture', image: `${IMG}/vienna.jpg` },
  { title: 'Копенгаген', loc: 'Дания', type: 'city', image: `${IMG}/copenhagen.jpg` },
] as const

// Generate 60 items with guaranteed images
const inspirationItems: InspirationItem[] = Array.from({ length: 60 }).map((_, i) => {
  const loc = locations[i % locations.length]
  return {
    id: `item-${i}`,
    title: loc.title,
    location: loc.loc,
    type: loc.type,
    imageUrl: loc.image,
    height: Math.floor(Math.random() * (400 - 280 + 1) + 280)
  }
})

interface InspirationBoardProps {
  onSelect: (place: string) => void
}

function InfiniteColumn({
  items,
  speed = 20,
  className,
  onSelect
}: {
  items: InspirationItem[]
  speed?: number
  className?: string
  onSelect: (place: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const columnRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn("relative h-full overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        ref={columnRef}
        className="flex flex-col gap-4"
        animate={{
          y: [0, -3000] // Increased scroll distance
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
          paused: isHovered
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="relative group cursor-pointer rounded-3xl overflow-hidden bg-surface-light/50 flex-shrink-0 border border-white/5"
            style={{ height: item.height }}
            onClick={() => onSelect(item.title + ' ' + item.location)}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {item.type}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold leading-tight mb-1.5">{item.title}</h3>
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.location}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function InspirationBoard({ onSelect }: InspirationBoardProps) {
  // Divide into 4 even columns
  const chunkSize = Math.ceil(inspirationItems.length / 4)
  const col1 = inspirationItems.slice(0, chunkSize)
  const col2 = inspirationItems.slice(chunkSize, chunkSize * 2)
  const col3 = inspirationItems.slice(chunkSize * 2, chunkSize * 3)
  const col4 = inspirationItems.slice(chunkSize * 3)

  return (
    <div className="h-full w-full overflow-hidden relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-start bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-3 tracking-tight">
            Куда отправимся?
          </h1>
          <p className="text-lg text-text-secondary/80 font-medium">
            Исследуйте мир и создавайте маршруты с AI
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-surface/30 backdrop-blur-md border border-white/10 text-sm font-medium text-text-secondary">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Вдохновение</span>
        </div>
      </div>

      {/* Animated Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 h-full px-4 md:px-6">
        <InfiniteColumn items={col1} speed={80} onSelect={onSelect} />
        <InfiniteColumn items={col2} speed={95} className="hidden sm:block" onSelect={onSelect} />
        <InfiniteColumn items={col3} speed={70} className="hidden md:block" onSelect={onSelect} />
        <InfiniteColumn items={col4} speed={85} className="hidden lg:block" onSelect={onSelect} />
      </div>
    </div>
  )
}
