import { useCallback, useEffect, useState } from 'react'
import type { SuitcaseExpense, SuitcaseGoal, SuitcaseTrip } from '@/types/suitcase'
import { ApiError } from '@/api/chatApi'
import {
  fetchSuitcaseWorkspace,
  createSuitcaseTrip,
  patchSuitcaseTrip,
  deleteSuitcaseTrip,
  createSuitcaseExpense,
  deleteSuitcaseExpense,
  patchSuitcaseGoal,
  createSuitcaseGoal,
  mapTripFromApi,
  mapExpenseFromApi,
  mapGoalFromApi,
} from '@/api/suitcaseApi'

export function useSuitcaseWorkspace(enabled: boolean) {
  const [trips, setTrips] = useState<SuitcaseTrip[]>([])
  const [expenses, setExpenses] = useState<SuitcaseExpense[]>([])
  const [goals, setGoals] = useState<SuitcaseGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const w = await fetchSuitcaseWorkspace()
      setTrips(w.trips.map(mapTripFromApi))
      setExpenses(w.expenses.map(mapExpenseFromApi))
      setGoals(w.goals.map(mapGoalFromApi))
    } catch (e) {
      const msg = e instanceof ApiError ? e.detail : 'Не удалось загрузить чемодан'
      setError(msg)
    } finally {
      setLoading(false)
      setHasLoadedOnce(true)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addTrip = useCallback(
    async (payload: Omit<SuitcaseTrip, 'id' | 'createdAt'>) => {
      await createSuitcaseTrip(payload)
      await refresh()
    },
    [refresh]
  )

  const updateTrip = useCallback(
    async (id: string, patch: Partial<SuitcaseTrip>) => {
      await patchSuitcaseTrip(id, patch)
      await refresh()
    },
    [refresh]
  )

  const removeTrip = useCallback(
    async (id: string) => {
      await deleteSuitcaseTrip(id)
      await refresh()
    },
    [refresh]
  )

  const addExpense = useCallback(
    async (payload: Omit<SuitcaseExpense, 'id'>) => {
      await createSuitcaseExpense(payload.tripId, payload)
      await refresh()
    },
    [refresh]
  )

  const removeExpense = useCallback(
    async (id: string) => {
      await deleteSuitcaseExpense(id)
      await refresh()
    },
    [refresh]
  )

  const setGoalProgress = useCallback(
    async (id: string, current: number) => {
      await patchSuitcaseGoal(id, { current })
      await refresh()
    },
    [refresh]
  )

  const addGoal = useCallback(
    async (payload: Omit<SuitcaseGoal, 'id'>) => {
      await createSuitcaseGoal(payload)
      await refresh()
    },
    [refresh]
  )

  return {
    trips,
    expenses,
    goals,
    loading,
    error,
    hasLoadedOnce,
    refresh,
    addTrip,
    updateTrip,
    deleteTrip: removeTrip,
    addExpense,
    deleteExpense: removeExpense,
    setGoalProgress,
    addGoal,
  }
}
