'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Zone } from '@/types/zone'

interface ZonesMapClientProps {
  zones: Zone[]
  activeZone?: Zone
}

function FitToActiveZone({ activeZone }: { activeZone?: Zone }) {
  const map = useMap()

  useEffect(() => {
    if (!activeZone || !activeZone.polygon.length) return

    const bounds = activeZone.polygon.map((point) => [point.lat, point.lng] as [number, number])

    map.fitBounds(bounds, { padding: [30, 30] })
  }, [activeZone, map])

  return null
}

export default function ZonesMapClient({ zones, activeZone }: ZonesMapClientProps) {
  const center = useMemo<[number, number]>(() => {
    if (activeZone?.polygon?.length) {
      return [activeZone.polygon[0].lat, activeZone.polygon[0].lng]
    }

    const firstPoint = zones[0]?.polygon?.[0]
    return firstPoint ? [firstPoint.lat, firstPoint.lng] : [-17.3895, -66.1568]
  }, [zones, activeZone])

  return (
    <div className="h-[320px] overflow-hidden rounded-xl md:h-[420px]">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToActiveZone activeZone={activeZone} />

        {zones.map((zone) => {
          const positions = zone.polygon.map((point) => [point.lat, point.lng] as [number, number])
          const isActive = activeZone?.id === zone.id

          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color: isActive ? '#f59e0b' : '#3b82f6',
                weight: isActive ? 3 : 2,
                fillOpacity: isActive ? 0.3 : 0.15
              }}
            >
              <Tooltip sticky>{zone.name}</Tooltip>
            </Polygon>
          )
        })}
      </MapContainer>
    </div>
  )
}
