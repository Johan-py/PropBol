'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Props = {
  images: string[]
}

export default function CityCarousel({ images }: Props) {
  const [index, setIndex] = useState(0)
  const activeImage = images[index] ?? '/placeholder-house.jpg'

  useEffect(() => {
    if (images.length <= 1) {
      setIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % images.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [images.length])

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
      <Image src={activeImage} alt="Ciudad destacada" fill className="object-cover" />
    </div>
  )
}
