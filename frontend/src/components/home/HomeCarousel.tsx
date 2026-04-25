'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HomeBanner } from './HomeBanner'

interface BannerData {
  id: number
  urlImagen: string
  titulo?: string
  subtitulo?: string
}

interface HomeCarouselProps {
  banners: BannerData[]
}

export const HomeCarousel = ({ banners }: HomeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    )
  }

  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      return
    }

    const timer = window.setInterval(() => {
      nextSlide()
    }, 4000)

    return () => window.clearInterval(timer)
  }, [banners.length, currentIndex, isPaused])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const deltaX = touchStartX.current - touchEndX

    if (deltaX > 50) {
      nextSlide()
    } else if (deltaX < -50) {
      prevSlide()
    }

    touchStartX.current = null
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <HomeBanner
        url={currentBanner.urlImagen}
        title={currentBanner.titulo || 'Encuentra tu lugar ideal'}
        subtitle={currentBanner.subtitulo}
      />

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 text-white/80 transition-all hover:scale-110 hover:text-white md:flex"
            aria-label="Ver banner anterior"
          >
            <ChevronLeft className="h-10 w-10 drop-shadow-lg" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 text-white/80 transition-all hover:scale-110 hover:text-white md:flex"
            aria-label="Ver siguiente banner"
          >
            <ChevronRight className="h-10 w-10 drop-shadow-lg" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
