'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'

interface Zona {
  id: number
  nombre: string
  referencia: string
  activa: boolean
  coordenadas?: { lat: number; lng: number; zoom: number }
}

interface Propiedad {
  id: number
  titulo: string
  precio: string
  tipo: string
  lat: number
  lng: number
  zonaId: number
}

interface MapaZonasProps {
  zonas: Zona[]
  zonaActiva: Zona | null
  onZonaClick: (zona: Zona) => void
}

const PROPIEDADES_MOCK: Propiedad[] = [
  {
    id: 1,
    titulo: 'Casa amplia zona norte',
    precio: '$85,000',
    tipo: 'Casa',
    lat: -17.3878,
    lng: -66.1548,
    zonaId: 1
  },
  {
    id: 2,
    titulo: 'Departamento moderno',
    precio: '$45,000',
    tipo: 'Departamento',
    lat: -17.3908,
    lng: -66.1582,
    zonaId: 1
  },
  {
    id: 3,
    titulo: 'Terreno en esquina',
    precio: '$30,000',
    tipo: 'Terreno',
    lat: -17.3928,
    lng: -66.1528,
    zonaId: 1
  },

  {
    id: 4,
    titulo: 'Casa con jardín',
    precio: '$95,000',
    tipo: 'Casa',
    lat: -17.4022,
    lng: -66.1468,
    zonaId: 2
  },
  {
    id: 5,
    titulo: 'Departamento 3 dorm.',
    precio: '$55,000',
    tipo: 'Departamento',
    lat: -17.4044,
    lng: -66.1476,
    zonaId: 2
  },
  {
    id: 6,
    titulo: 'Oficina céntrica',
    precio: '$40,000',
    tipo: 'Oficina',
    lat: -17.4031,
    lng: -66.1456,
    zonaId: 2
  },

  {
    id: 7,
    titulo: 'Casa familiar',
    precio: '$75,000',
    tipo: 'Casa',
    lat: -17.3942,
    lng: -66.1586,
    zonaId: 3
  },
  {
    id: 8,
    titulo: 'Terreno plano',
    precio: '$25,000',
    tipo: 'Terreno',
    lat: -17.3962,
    lng: -66.1612,
    zonaId: 3
  }
]

const COLORES_TIPO: Record<string, string> = {
  Casa: '#3b82f6',
  Departamento: '#8b5cf6',
  Terreno: '#f59e0b',
  Oficina: '#10b981'
}

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
}

function FlyToZona({ zona }: { zona: Zona | null }) {
  const map = useMap()

  useEffect(() => {
    if (!zona?.coordenadas) return

    map.flyTo([zona.coordenadas.lat, zona.coordenadas.lng], zona.coordenadas.zoom ?? 14, {
      duration: 0.8
    })
  }, [zona, map])

  return null
}

function createZonaIcon(activa: boolean): L.DivIcon {
  const color = activa ? '#d97706' : '#6b7280'

  return L.divIcon({
    className: '',
    html: `
      <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        <div style="
          width:20px;height:20px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background-color:${color};
          border:2px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
}

function createPropiedadIcon(tipo: string): L.DivIcon {
  const color = COLORES_TIPO[tipo] || '#6b7280'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};
        color:white;
        font-size:10px;
        font-weight:bold;
        padding:3px 8px;
        border-radius:12px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        border:2px solid white;
      ">${tipo}</div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
    popupAnchor: [0, -16]
  })
}

function getZonaPolygon(zona: Zona): LatLngExpression[] | null {
  if (!zona.coordenadas) return null

  const { lat, lng } = zona.coordenadas
  const deltaLat = 0.006
  const deltaLng = 0.008

  return [
    [lat + deltaLat, lng - deltaLng * 0.4],
    [lat + deltaLat * 0.4, lng + deltaLng],
    [lat - deltaLat * 0.8, lng + deltaLng * 0.7],
    [lat - deltaLat, lng - deltaLng * 0.3],
    [lat - deltaLat * 0.2, lng - deltaLng]
  ]
}

export default function MapaZonas({ zonas = [], zonaActiva, onZonaClick }: MapaZonasProps) {
  const center: [number, number] = [-17.3895, -66.1568]

  const propiedades = zonaActiva ? PROPIEDADES_MOCK.filter((p) => p.zonaId === zonaActiva.id) : []

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToZona zona={zonaActiva} />

      {zonas.map((zona) => {
        const polygon = getZonaPolygon(zona)
        if (!polygon) return null

        const esActiva = zonaActiva?.id === zona.id

        return (
          <Polygon
            key={`polygon-${zona.id}`}
            positions={polygon}
            pathOptions={{
              color: esActiva ? '#d97706' : '#6b7280',
              weight: esActiva ? 3 : 2,
              fillColor: esActiva ? '#f59e0b' : '#9ca3af',
              fillOpacity: esActiva ? 0.28 : 0.14
            }}
            eventHandlers={{
              click: () => onZonaClick(zona)
            }}
          >
            <Popup>
              <div className="text-sm min-w-[150px]">
                <p className="font-semibold text-stone-800">{zona.nombre}</p>
                <p className="text-stone-500 text-xs mt-0.5">{zona.referencia}</p>
                {esActiva && (
                  <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Zona activa
                  </span>
                )}
              </div>
            </Popup>
          </Polygon>
        )
      })}

      {zonas.map((zona) => {
        if (!zona.coordenadas) return null

        return (
          <Marker
            key={`zona-${zona.id}`}
            position={[zona.coordenadas.lat, zona.coordenadas.lng]}
            icon={createZonaIcon(zonaActiva?.id === zona.id)}
            eventHandlers={{ click: () => onZonaClick(zona) }}
          >
            <Popup>
              <div className="text-sm min-w-[140px]">
                <p className="font-semibold text-stone-800">{zona.nombre}</p>
                <p className="text-stone-500 text-xs mt-0.5">{zona.referencia}</p>
                {zona.activa && (
                  <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Activa
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {propiedades.map((prop) => (
        <Marker
          key={`prop-${prop.id}`}
          position={[prop.lat, prop.lng]}
          icon={createPropiedadIcon(prop.tipo)}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-semibold text-stone-800">{prop.titulo}</p>
              <p className="font-bold text-amber-600 mt-1">{prop.precio}</p>
              <p className="text-xs text-stone-500 mt-0.5">{prop.tipo}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
