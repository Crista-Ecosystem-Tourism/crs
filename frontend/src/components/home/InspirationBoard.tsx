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
const locations = [
  { title: 'Альпы', loc: 'Швейцария', type: 'nature', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80' },
  { title: 'Озеро Брайес', loc: 'Италия', type: 'nature', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=80' },
  { title: 'Мальдивы', loc: 'Мальдивы', type: 'nature', image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=80' },
  { title: 'Париж', loc: 'Франция', type: 'city', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { title: 'Токио', loc: 'Япония', type: 'city', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80' },
  { title: 'Венеция', loc: 'Италия', type: 'culture', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80' },
  { title: 'Чинкве-Терре', loc: 'Италия', type: 'nature', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80' },
  { title: 'Норвегия', loc: 'Норвегия', type: 'nature', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80' },
  { title: 'Стамбул', loc: 'Турция', type: 'city', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80' },
  { title: 'Санторини', loc: 'Греция', type: 'city', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80' },
  { title: 'Бангкок', loc: 'Таиланд', type: 'food', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80' },
  { title: 'Бали', loc: 'Индонезия', type: 'nature', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { title: 'Амстердам', loc: 'Нидерланды', type: 'culture', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80' },
  { title: 'Патагония', loc: 'Аргентина', type: 'nature', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&q=80' },
  { title: 'Дубай', loc: 'ОАЭ', type: 'city', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&q=80' },
  { title: 'Карибы', loc: 'Карибские о-ва', type: 'nature', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80' },
  { title: 'Новая Зеландия', loc: 'Новая Зеландия', type: 'nature', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80' },
  { title: 'Прованс', loc: 'Франция', type: 'culture', image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80' },
  { title: 'Киото', loc: 'Япония', type: 'culture', image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=600&q=80' },
  { title: 'Марракеш', loc: 'Марокко', type: 'culture', image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=600&q=80' },
  { title: 'Чикаго', loc: 'США', type: 'city', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80' },
  { title: 'Убуд', loc: 'Индонезия', type: 'culture', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80' },
  { title: 'Мауи', loc: 'Гавайи', type: 'nature', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=600&q=80' },
  { title: 'Сеул', loc: 'Южная Корея', type: 'food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
  { title: 'Кения', loc: 'Кения', type: 'nature', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&q=80' },
  { title: 'Исландия', loc: 'Исландия', type: 'nature', image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80' },
  { title: 'Агра', loc: 'Индия', type: 'culture', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80' },
  { title: 'Шефшауэн', loc: 'Марокко', type: 'city', image: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?w=600&q=80' },
  { title: 'Осака', loc: 'Япония', type: 'culture', image: 'https://images.unsplash.com/photo-1523528283115-9bf9b4690132?w=600&q=80' },
  { title: 'Бавария', loc: 'Германия', type: 'nature', image: 'https://images.unsplash.com/photo-1467269204594-9661b133dd2b?w=600&q=80' },
  { title: 'Барселона', loc: 'Испания', type: 'city', image: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600&q=80' },
  { title: 'Прага', loc: 'Чехия', type: 'city', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80' },
  { title: 'Рио-де-Жанейро', loc: 'Бразилия', type: 'nature', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80' },
  { title: 'Будапешт', loc: 'Венгрия', type: 'culture', image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80' },
  { title: 'Лиссабон', loc: 'Португалия', type: 'culture', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80' },
  { title: 'Сингапур', loc: 'Сингапур', type: 'city', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
  { title: 'Петра', loc: 'Иордания', type: 'culture', image: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=600&q=80' },
  { title: 'Афины', loc: 'Греция', type: 'culture', image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=600&q=80' },
  { title: 'Мачу-Пикчу', loc: 'Перу', type: 'culture', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80' },
  { title: 'Вена', loc: 'Австрия', type: 'culture', image: 'https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=600&q=80' },
  { title: 'Копенгаген', loc: 'Дания', type: 'city', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80' }
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
