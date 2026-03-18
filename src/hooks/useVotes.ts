import { useEffect, useState } from 'react'
import { getUserVotes } from '@/services/vote.service'
import type { Vote } from '@/types'

export function useVotes(voterId?: string) {
  const canFetch = !!voterId

  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(canFetch)

  useEffect(() => {

    if (!voterId) {
      return
    }

    let isMounted = true

    const fetchVotes = async () => {
      try {
        const data = await getUserVotes(voterId)

        if (isMounted) {
          setVotes(data)
          setLoading(false)
        }

      } catch (err) {
        console.error('Error fetching votes:', err)

        if (isMounted) setLoading(false)
      }
    }

    fetchVotes()

    return () => {
      isMounted = false
    }

  }, [voterId])

  return { votes: canFetch ? votes : [], loading: canFetch ? loading : false }
}
