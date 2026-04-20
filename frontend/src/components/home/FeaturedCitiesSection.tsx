'use client'

import { useRouter } from 'next/navigation'

import CityCard from '@/components/home/CityCard'
import { useCitiesCarousel } from '@/hooks/useCitiesCarousel'
import type { City } from '@/types/city'

const featuredCities: City[] = [
  {
    id: 1,
    name: 'Cochabamba',
    slug: 'cochabamba',
    description: 'Explora zonas residenciales y sectores con alta demanda de vivienda.',
    images: ['/placeholder-house.jpg', '/icons/fondoTerminos.jpg']
  },
  {
    id: 2,
    name: 'Santa Cruz',
    slug: 'santa-cruz',
    description: 'Descubre barrios en crecimiento y oportunidades inmobiliarias destacadas.',
    images: ['/icons/fondoTerminos.jpg', '/placeholder-house.jpg']
  },
  {
    id: 3,
    name: 'La Paz',
    slug: 'la-paz',
    description: 'Encuentra alternativas urbanas con vistas, conectividad y oferta variada.',
    images: ['/placeholder-house.jpg', '/house.svg']
  }
]

export default function FeaturedCitiesSection() {
  const router = useRouter()
  const { index, next, prev } = useCitiesCarousel(featuredCities.length)
  const currentCity = featuredCities[index]

  const handleClick = (slug: string) => {
    router.push(`/busqueda?ciudad=${slug}`)
  }

  return (
    <section className="px-6 py-10 sm:px-8 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 sm:text-4xl md:text-5xl">
          ¿Dónde quieres vivir?
        </h2>

        <p className="mt-3 max-w-2xl text-base text-stone-600 sm:text-lg">
          Explora las ciudades más buscadas
        </p>

        <div className="mt-8 w-full rounded-[2rem] border border-stone-200/80 bg-stone-50/60 px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              aria-label="Ver ciudad anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl text-amber-600 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            <div className="w-full max-w-sm sm:max-w-md">
              <CityCard city={currentCity} onClick={handleClick} />
            </div>

            <button
              type="button"
              onClick={next}
              disabled={index === featuredCities.length - 1}
              aria-label="Ver siguiente ciudad"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl text-amber-600 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {featuredCities.map((city, cityIndex) => (
              <span
                key={city.id}
                className={`h-2.5 rounded-full transition-all ${
                  cityIndex === index ? 'w-8 bg-amber-500' : 'w-2.5 bg-stone-300'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
