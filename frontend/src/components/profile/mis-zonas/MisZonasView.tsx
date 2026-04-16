'use client'

import { useState } from 'react'
import ZonesList from '@/components/profile/mis-zonas/ZonesList'
import { mockZones } from '@/data/mockZones'
import { Zone } from '@/types/zone'

export default function MisZonasView() {
  const [zones, setZones] = useState<Zone[]>(mockZones)

  const handleSelect = (zoneId: string) => {
    setZones((prevZones) =>
      prevZones.map((zone) => ({
        ...zone,
        isActive: zone.id === zoneId
      }))
    )
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Mis Zonas</h1>
      <p className="mt-2 text-sm text-gray-600">
        Selecciona una zona para continuar con la gestión.
      </p>

      <div className="mt-4">
        <ZonesList zones={zones} onSelect={handleSelect} />
      </div>
    </section>
  )
}
