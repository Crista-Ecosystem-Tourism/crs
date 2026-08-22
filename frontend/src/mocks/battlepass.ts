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
  /** Что это даёт на самом деле, без обещаний сверх продукта */
  detail: string
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
  subtitle: string
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
  subtitle: 'Уровни открываются по мере игры и остаются с вами навсегда',
  tiers: [
    {
      level: 1,
      threshold: 20,
      free: { kind: 'stamp', title: 'Штамп «Первый шаг»', detail: 'Появится на первой странице паспорта' },
      premium: { kind: 'frame', title: 'Рамка «Синий час»', detail: 'Оформление обложки паспорта' },
    },
    {
      level: 2,
      threshold: 60,
      free: { kind: 'quest', title: 'Ветка квестов по городу', detail: 'Три дополнительные точки в выбранном городе' },
      premium: { kind: 'streak-freeze', title: 'Заморозка стрика', detail: 'Один пропущенный день не сбрасывает серию' },
    },
    {
      level: 3,
      threshold: 120,
      free: { kind: 'title', title: 'Звание «Навигатор»', detail: 'Видно друзьям в лидерборде' },
      premium: { kind: 'storage', title: 'Галерея +5 ГБ', detail: 'Больше места под снимки из поездок' },
    },
    {
      level: 4,
      threshold: 200,
      free: { kind: 'stamp', title: 'Штамп «Полуночник»', detail: 'За квесты, закрытые ночью' },
      premium: { kind: 'quest', title: 'Премиальные квесты', detail: 'Скрытый слой точек в пилотных городах' },
    },
    {
      level: 5,
      threshold: 300,
      free: { kind: 'frame', title: 'Рамка «Разводной мост»', detail: 'Оформление обложки паспорта' },
      premium: { kind: 'discount', title: 'Скидка на партнёрский тур', detail: 'Действует при бронировании через Crista' },
    },
    {
      level: 6,
      threshold: 420,
      free: { kind: 'title', title: 'Звание «Хранитель маршрутов»', detail: 'Видно в профиле и на мини-сайтах' },
      premium: { kind: 'stamp', title: 'Золотая печать', detail: 'Крупная печать на развороте паспорта' },
    },
  ],
}
