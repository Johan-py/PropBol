'use client'

import { useMemo, useState } from 'react'
import ZonesList from '@/components/profile/mis-zonas/ZonesList'
import ZonesMap from '@/components/profile/mis-zonas/ZonesMap'
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

  const activeZone = useMemo(() => zones.find((zone) => zone.isActive), [zones])

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Mis Zonas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona tus zonas guardadas para reutilizar búsquedas por área geográfica.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <ZonesMap zones={zones} activeZone={activeZone} />

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mis zonas guardadas</h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona una zona para verla como activa.
            </p>
          </div>

          <ZonesList zones={zones} onSelect={handleSelect} />
        </div>
      </div>
    </section>
  )
}
