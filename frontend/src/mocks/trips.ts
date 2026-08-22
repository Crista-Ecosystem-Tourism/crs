/**
 * Мои путешествия. По продуктовому документу (раздел 6) каждая завершённая
 * поездка превращается в мини-сайт: карта точек, факты, фото, штампы и
 * статистика. Здесь лежат данные, из которых страница собирается.
 */

export type TripStatus = 'completed' | 'ongoing'
export type TripPrivacy = 'public' | 'link' | 'private'

export interface TripPoint {
  id: string
  title: string
  note: string
  day: number
}

export interface Trip {
  id: string
  slug: string
  title: string
  country: string
  city: string
  cover: string
  photos: string[]
  startDate: string
  endDate: string
  status: TripStatus
  privacy: TripPrivacy
  stats: {
    days: number
    distanceKm: number
    budget: number
    saved: number
    placesVisited: number
    stamps: number
  }
  summary: string
  points: TripPoint[]
}

export const privacyLabel: Record<TripPrivacy, string> = {
  public: 'Публично',
  link: 'По ссылке',
  private: 'Только я',
}

export const trips: Trip[] = [
  {
    id: 'spb-2026',
    slug: 'peterburg-belye-nochi',
    title: 'Белые ночи в Петербурге',
    country: 'Россия',
    city: 'Санкт-Петербург',
    cover: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=600&q=80',
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&q=80',
    ],
    startDate: '2026-06-14',
    endDate: '2026-06-18',
    status: 'completed',
    privacy: 'public',
    stats: { days: 5, distanceKm: 47, budget: 58400, saved: 9200, placesVisited: 14, stamps: 2 },
    summary:
      'Пять дней вокруг разводных мостов и музеев. Гуляли ночами, когда город не выключает свет, и успели поймать развод Дворцового моста дважды.',
    points: [
      { id: 'p1', title: 'Эрмитаж', note: 'Пришли к открытию и обошли Павильонный зал без очереди', day: 1 },
      { id: 'p2', title: 'Спас на Крови', note: 'Мозаика внутри оказалась ярче, чем на всех снимках', day: 2 },
      { id: 'p3', title: 'Развод Дворцового моста', note: 'Заняли место на набережной за полчаса до 01:10', day: 2 },
      { id: 'p4', title: 'Петропавловская крепость', note: 'Полуденный выстрел слышно на другом берегу', day: 3 },
      { id: 'p5', title: 'Невский проспект', note: 'Прошли целиком от Адмиралтейства до площади Восстания', day: 4 },
    ],
  },
  {
    id: 'georgia-2026',
    slug: 'gruziya-gastrotur',
    title: 'Гастротур по Грузии',
    country: 'Грузия',
    city: 'Тбилиси и Батуми',
    cover: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
    ],
    startDate: '2026-04-02',
    endDate: '2026-04-09',
    status: 'completed',
    privacy: 'link',
    stats: { days: 8, distanceKm: 612, budget: 74300, saved: 14100, placesVisited: 19, stamps: 1 },
    summary:
      'Восемь дней между Тбилиси и Батуми. Считали хинкали десятками, научились правильно есть их за складки и ни разу не проткнули тесто.',
    points: [
      { id: 'g1', title: 'Серные бани Абанотубани', note: 'Пришли рано утром, пока не набежали туристы', day: 1 },
      { id: 'g2', title: 'Крепость Нарикала', note: 'Поднялись по канатке ровно к закату', day: 2 },
      { id: 'g3', title: 'Хинкали на Мтацминда', note: 'Лучшие за всю поездку, порция на двоих', day: 3 },
      { id: 'g4', title: 'Али и Нино', note: 'Дождались, когда фигуры пройдут сквозь друг друга', day: 6 },
    ],
  },
  {
    id: 'sochi-2026',
    slug: 'sochi-gory-i-more',
    title: 'Сочи: горы и море за раз',
    country: 'Россия',
    city: 'Сочи',
    cover: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&q=80',
    photos: ['https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&q=80'],
    startDate: '2026-08-16',
    endDate: '2026-08-24',
    status: 'ongoing',
    privacy: 'private',
    stats: { days: 9, distanceKm: 168, budget: 42000, saved: 3400, placesVisited: 6, stamps: 0 },
    summary:
      'Поездка ещё идёт. Утром поднимаемся на Розу Хутор, вечером возвращаемся к морю. Мини-сайт соберётся полностью, когда вернёмся.',
    points: [
      { id: 's1', title: 'Роза Хутор', note: 'Поднялись на 2320, наверху было плюс девять', day: 2 },
      { id: 's2', title: 'Чайные плантации', note: 'Пробовали краснодарский чай прямо на склоне', day: 4 },
    ],
  },
]

export function formatTripDates(trip: Trip): string {
  const from = new Date(trip.startDate)
  const to = new Date(trip.endDate)
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  const dayMonth = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' })
  const dayOnly = new Intl.DateTimeFormat('ru', { day: 'numeric' })
  const year = from.getFullYear()
  return sameMonth
    ? `${dayOnly.format(from)} - ${dayMonth.format(to)} ${year}`
    : `${dayMonth.format(from)} - ${dayMonth.format(to)} ${year}`
}
