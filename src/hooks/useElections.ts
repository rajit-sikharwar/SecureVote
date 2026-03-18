import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { subscribeElectionsForVoter, subscribeAllElections } from '@/services/election.service'
import type { Election } from '@/types'

export function useElections() {

  const { user } = useAuthStore()
  const canSubscribe = !!user && (user.role === 'admin' || !!user.category)

  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(canSubscribe)

  useEffect(() => {

    if (!user || !canSubscribe) {
      return
    }

    let unsub: (() => void) | undefined

    if (user.role === 'admin') {
      unsub = subscribeAllElections((data: Election[]) => {
        setElections(data)
        setLoading(false)
      })
    } 
    else if (user.category) {
      unsub = subscribeElectionsForVoter(user.category, (data: Election[]) => {
        setElections(data)
        setLoading(false)
      })
    }

    return () => {
      if (unsub) unsub()
    }

  }, [user, canSubscribe])

  return { elections: canSubscribe ? elections : [], loading: canSubscribe ? loading : false }
}
