import { useState } from 'react'

export function useCitiesCarousel(total: number) {
  const [index, setIndex] = useState(0)

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, total - 1))
  }

  const prev = () => {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  return { index, next, prev }
}
