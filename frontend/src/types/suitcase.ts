/** Модель поездок/расходов приложения Suitcase; на сайте данные с API Crista (PostgreSQL). */

export interface SuitcaseTrip {
  id: string
  country: string
  city: string
  startDate: string
  endDate: string
  image?: string
  mood?: string
  routeJson?: string
  impressions?: string
  photos?: string[]
  isArchived?: boolean
  createdAt: string
}

export interface SuitcaseExpense {
  id: string
  tripId: string
  amount: number
  category: string
  title: string
  date: string
  currency?: string
}

export interface SuitcaseGoal {
  id: string
  title: string
  current: number
  total: number
  color: string
}
