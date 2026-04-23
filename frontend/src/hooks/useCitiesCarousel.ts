<<<<<<< HEAD
import { useState } from 'react'

export function useCitiesCarousel(total: number) {
  const [index, setIndex] = useState(0)

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, total - 1))
=======
import { useEffect, useState } from "react"

export function useCitiesCarousel(totalPages: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(totalPages - 1, 0)))
  }, [totalPages])

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, Math.max(totalPages - 1, 0)))
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  }

  const prev = () => {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

<<<<<<< HEAD
  return { index, next, prev }
=======
  const goTo = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(nextIndex, Math.max(totalPages - 1, 0))))
  }

  return { index, next, prev, goTo }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
}
