'use client'

import CityCarousel from '@/components/home/CityCarousel'
import type { City } from '@/types/city'

type Props = {
  city: City
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
  )
}
