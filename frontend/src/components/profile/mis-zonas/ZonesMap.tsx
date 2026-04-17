'use client'

import dynamic from 'next/dynamic'
import type { Zone } from '@/types/zone'

const ZonesMapDynamic = dynamic(() => import('./ZonesMapClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-100 text-center text-sm text-gray-500 md:h-[420px]">
      Cargando mapa de zonas...
    </div>
  )
})

interface ZonesMapProps {
  zones: Zone[]
  activeZone?: Zone
}

export default function ZonesMap({ zones, activeZone }: ZonesMapProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mapa</h2>

        <button
          type="button"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          Nueva zona
        </button>
      </div>

      <ZonesMapDynamic zones={zones} activeZone={activeZone} />

      {activeZone && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Zona activa:</span> {activeZone.name}
        </div>
      )}
    </div>
  )
}
