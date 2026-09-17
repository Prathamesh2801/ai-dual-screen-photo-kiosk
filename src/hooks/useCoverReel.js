import { useCallback, useEffect, useState } from 'react'
import { TV_REEL_LIMIT } from '../config'
import { subscribeToCovers } from '../services/coverStream'



const STORAGE_KEY = 'maxter.tv.reel.v1'

function loadReel() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    return saved
      .filter((c) => c && typeof c.id === 'string' && typeof c.imageUrl === 'string')
      .slice(-TV_REEL_LIMIT)
  } catch {
    return []
  }
}

export function useCoverReel() {
  const [reel, setReel] = useState(loadReel)
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    return subscribeToCovers({
      onStatus: setStatus,
      onCover: (cover) => {
        setReel((prev) => {
          if (prev[prev.length - 1]?.id === cover.id) return prev

          const rest = prev.filter((c) => c.id !== cover.id)
          return [...rest, { ...cover, receivedAt: Date.now() }].slice(
            -TV_REEL_LIMIT,
          )
        })
      },
    })
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reel))
    } catch {
      // A full or disabled store only costs history across reloads.
    }
  }, [reel])


  const drop = useCallback((id) => {
    setReel((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { reel, status, drop }
}
