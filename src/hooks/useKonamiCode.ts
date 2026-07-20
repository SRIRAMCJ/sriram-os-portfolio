'use client'

import { useEffect, useState, useCallback } from 'react'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

export function useKonamiCode(onSuccess: () => void) {
  const [index, setIndex] = useState(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === KONAMI_CODE[index]) {
      if (index === KONAMI_CODE.length - 1) {
        onSuccess()
        setIndex(0)
      } else {
        setIndex(prev => prev + 1)
      }
    } else {
      setIndex(0)
    }
  }, [index, onSuccess])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { progress: index / KONAMI_CODE.length }
}
