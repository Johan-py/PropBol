'use client'

import CityCarousel from '@/components/home/CityCarousel'
import type { City } from '@/types/city'

type Props = {
  city: City
<<<<<<< HEAD
  onClick: (slug: string) => void
}

export default function CityCard({ city, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(city.slug)}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <CityCarousel images={city.images} />

      <div className="space-y-2 p-4">
        <h3 className="text-2xl font-semibold text-stone-900">{city.name}</h3>
        <p className="text-sm text-stone-600">{city.description}</p>
      </div>
    </div>
=======
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
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  )
}
