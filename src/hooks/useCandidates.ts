import { useEffect, useState } from 'react'
import { subscribeCandidates, subscribeAllCandidatesForElection } from '@/services/candidate.service'
import type { Candidate, UserCategory } from '@/types'

export function useCandidates(electionId: string, category?: UserCategory, isAdmin?: boolean) {
  const canSubscribe = !!electionId && (isAdmin || !!category)

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(canSubscribe)

  useEffect(() => {

    if (!electionId || !canSubscribe) {
      return
    }

    let unsub: (() => void) | undefined

    if (isAdmin) {
      unsub = subscribeAllCandidatesForElection(electionId, (data: Candidate[]) => {
        setCandidates(data)
        setLoading(false)
      })
    } 
    else if (category) {
      unsub = subscribeCandidates(electionId, category, (data: Candidate[]) => {
        setCandidates(data)
        setLoading(false)
      })
    }

    return () => {
      if (unsub) unsub()
    }

  }, [electionId, category, isAdmin, canSubscribe])

  return { candidates: canSubscribe ? candidates : [], loading: canSubscribe ? loading : false }
}
