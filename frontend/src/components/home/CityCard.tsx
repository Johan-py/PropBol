'use client'

import CityCarousel from '@/components/home/CityCarousel'
import type { City } from '@/types/city'

type Props = {
  city: City
  onClick: (city: City) => void
}

export default function CityCard({ city, onClick }: Props) {
  const handleClick = () => {
    onClick(city)
  }

  return (
    <article
      onClick={handleClick}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <CityCarousel images={city.images} cityName={city.name} />

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-stone-900">{city.name}</h3>
          {city.locationReference ? (
            <p className="text-sm font-medium text-stone-500">{city.locationReference}</p>
          ) : null}
        </div>

        <p className="text-sm leading-6 text-stone-600">{city.description}</p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            handleClick()
          }}
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Ver propiedades
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}
