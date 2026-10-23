import { useCallback, useEffect, useState } from 'react'
import { getGamePassport, type GamePassport } from '@/api/gameApi'

export type HomePassportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; passport: GamePassport }

/** Server-owned game state for the home screen; nothing here is computed on the client. */
export function useHomePassport(userId: string | undefined) {
  const [state, setState] = useState<HomePassportState>({ status: 'idle' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!userId) {
      setState({ status: 'idle' })
      return
    }
    let active = true
    setState({ status: 'loading' })
    getGamePassport()
      .then((passport) => { if (active) setState({ status: 'ready', passport }) })
      .catch(() => { if (active) setState({ status: 'error' }) })
    return () => { active = false }
  }, [userId, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  return { state, retry }
}
