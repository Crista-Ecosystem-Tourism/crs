/**
 * Пропуск путешественника. Постоянный, а не сезонный: прогресс никуда
 * не сгорает, уровни открываются по мере игры. Очки капают со всего
 * игрового слоя (точки квестов, вопросы дня, закрытые города).
 * Верхняя дорожка доступна всем, нижняя открывается подпиской.
 */

export type RewardKind = 'stamp' | 'frame' | 'streak-freeze' | 'quest' | 'storage' | 'discount' | 'title'

export interface Reward {
  kind: RewardKind
  title: string
  titleEn: string
  /** Что это даёт на самом деле, без обещаний сверх продукта */
  detail: string
  detailEn: string
}

export interface PassTier {
  level: number
  /** Сколько очков нужно набрать суммарно к этому уровню */
  threshold: number
  free: Reward
  premium: Reward
}

export interface Pass {
  id: string
  name: string
  nameEn: string
  subtitle: string
  subtitleEn: string
  tiers: PassTier[]
}

export const rewardLabel: Record<RewardKind, string> = {
  stamp: 'Штамп',
  frame: 'Рамка паспорта',
  'streak-freeze': 'Заморозка стрика',
  quest: 'Квесты',
  storage: 'Галерея',
  discount: 'Скидка',
  title: 'Звание',
}

export const pass: Pass = {
  id: 'traveller-pass',
  name: 'Пропуск путешественника',
  nameEn: 'Traveler Pass',
  subtitle: 'Уровни открываются по мере игры и остаются с вами навсегда',
  subtitleEn: 'Progress through levels as you play. Your rewards are yours to keep.',
  tiers: [
    {
      level: 1,
      threshold: 20,
      free: { kind: 'stamp', title: 'Штамп «Первый шаг»', titleEn: 'First Steps Stamp', detail: 'Появится на первой странице паспорта', detailEn: 'Appears on the first page of your passport.' },
      premium: { kind: 'frame', title: 'Рамка «Синий час»', titleEn: 'Blue Hour Frame', detail: 'Оформление обложки паспорта', detailEn: 'A decorative passport cover frame.' },
    },
    {
      level: 2,
      threshold: 60,
      free: { kind: 'quest', title: 'Ветка квестов по городу', titleEn: 'City quest line', detail: 'Три дополнительные точки в выбранном городе', detailEn: 'Three extra stops in your chosen city.' },
      premium: { kind: 'streak-freeze', title: 'Заморозка стрика', titleEn: 'Streak freeze', detail: 'Один пропущенный день не сбрасывает серию', detailEn: 'Miss one day without losing your streak.' },
    },
    {
      level: 3,
      threshold: 120,
      free: { kind: 'title', title: 'Звание «Навигатор»', titleEn: 'Navigator title', detail: 'Видно друзьям в лидерборде', detailEn: 'Visible to your friends on the leaderboard.' },
      premium: { kind: 'storage', title: 'Галерея +5 ГБ', titleEn: 'Gallery +5 GB', detail: 'Больше места под снимки из поездок', detailEn: 'More space for photos from your trips.' },
    },
    {
      level: 4,
      threshold: 200,
      free: { kind: 'stamp', title: 'Штамп «Полуночник»', titleEn: 'Night Owl Stamp', detail: 'За квесты, закрытые ночью', detailEn: 'Earned by completing quests at night.' },
      premium: { kind: 'quest', title: 'Премиальные квесты', titleEn: 'Premium quests', detail: 'Скрытый слой точек в пилотных городах', detailEn: 'A hidden layer of stops in pilot cities.' },
    },
    {
      level: 5,
      threshold: 300,
      free: { kind: 'frame', title: 'Рамка «Разводной мост»', titleEn: 'Drawbridge Frame', detail: 'Оформление обложки паспорта', detailEn: 'A decorative passport cover frame.' },
      premium: { kind: 'discount', title: 'Скидка на партнёрский тур', titleEn: 'Partner tour discount', detail: 'Действует при бронировании через Crista', detailEn: 'Valid when booking through Crista.' },
    },
    {
      level: 6,
      threshold: 420,
      free: { kind: 'title', title: 'Звание «Хранитель маршрутов»', titleEn: 'Route Keeper title', detail: 'Видно в профиле и на мини-сайтах', detailEn: 'Visible on your profile and trip microsites.' },
      premium: { kind: 'stamp', title: 'Золотая печать', titleEn: 'Golden Seal', detail: 'Крупная печать на развороте паспорта', detailEn: 'A large stamp on a passport spread.' },
    },
  ],
}
