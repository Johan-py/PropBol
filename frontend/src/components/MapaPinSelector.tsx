'use client'

import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css' // MAPAS HU11
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'
// Importar CSS y L dinámicamente para evitar errores de SSR
if (typeof window !== 'undefined') {
  const { GestureHandling } = require('leaflet-gesture-handling');
  L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
}

const pinIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
      background: #f97316;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        top: 6px;
        left: 6px;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20]
})

type Props = {
  pinCoords: { lat: number; lng: number } | null
  setPinCoords: (v: { lat: number; lng: number } | null) => void

  vertices: [number, number][]
  setVertices: (v: [number, number][]) => void

  modoPinActivo: boolean
  modoDifuminadoActivo: boolean
}

function EventosMapa({
  modoPinActivo,
  modoDifuminadoActivo,
  setPinCoords,
  vertices,
  setVertices,
  setMensajeLimite,
}: any) {
  useMapEvents({
    click(e) {
      if (modoPinActivo) {
        setPinCoords({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }

      if (modoDifuminadoActivo) {
        // Limitar máximo de puntos
  if (vertices.length >= 10) {
   setMensajeLimite(true)

  setTimeout(() => {
    setMensajeLimite(false)
  }, 2000)

  return
  }
  const nuevoPunto: [number, number] = [
    e.latlng.lat,
    e.latlng.lng
  ]

  if (vertices.length < 3) {
    setVertices([...vertices, nuevoPunto])
  } else {
    let mejorIndex = 0
    let menorDistancia = Infinity

    for (let i = 0; i < vertices.length; i++) {
      const actual = vertices[i]
      const siguiente = vertices[(i + 1) % vertices.length]

      const centroLat = (actual[0] + siguiente[0]) / 2
      const centroLng = (actual[1] + siguiente[1]) / 2

      const distancia = Math.sqrt(
        Math.pow(nuevoPunto[0] - centroLat, 2) +
        Math.pow(nuevoPunto[1] - centroLng, 2)
      )

      if (distancia < menorDistancia) {
        menorDistancia = distancia
        mejorIndex = i + 1
      }
    }

    const nuevosVertices = [...vertices]
    nuevosVertices.splice(mejorIndex, 0, nuevoPunto)

    setVertices(nuevosVertices)
  }
}
}
  })

  return null
}

export default function MapaPinSelector({
  pinCoords,
  setPinCoords,
  vertices,
  setVertices,
  modoPinActivo,
  modoDifuminadoActivo
}: Props) {
  const [mensajeLimite, setMensajeLimite] = useState(false)
 
  return (
    <div className="relative">
    <MapContainer
      center={[-17.3895, -66.1568]}
      zoom={13}
      scrollWheelZoom
      style={{ height: '320px', width: '100%' }}
      // Agregado: Control nativo del cursor y bloqueo de arrastre en modo dibujo MAPAS HU11
      {...({ 
        gestureHandling: true,
        gestureHandlingOptions: {
          text: {
            touch: "Usa dos dedos para mover el mapa",
            scroll: "Usa ctrl + scroll para hacer zoom en el mapa",
            scrollMac: "Usa \u2318 + scroll para hacer zoom en el mapa"
          }
        }
      } as any)}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <EventosMapa
        modoPinActivo={modoPinActivo}
        modoDifuminadoActivo={modoDifuminadoActivo}
        setPinCoords={setPinCoords}
        vertices={vertices}
        setVertices={setVertices}
        setMensajeLimite={setMensajeLimite}
      />

     {pinCoords && (
  <Marker
    position={[pinCoords.lat, pinCoords.lng]}
    icon={pinIcon}
    draggable={true}
     eventHandlers={{
      drag: (e) => {
        const map = e.target._map
        const bounds = map.getBounds()
        const pos = e.target.getLatLng()

        const lat = Math.min(
          Math.max(pos.lat, bounds.getSouth()),
          bounds.getNorth()
        )

        const lng = Math.min(
          Math.max(pos.lng, bounds.getWest()),
          bounds.getEast()
        )
        e.target.setLatLng([lat, lng])
      },

      dragend: (e) => {
        const pos = e.target.getLatLng()

        setPinCoords({
          lat: pos.lat,
          lng: pos.lng
        })
      }
    }}
    
  />
)}

{vertices.length >= 3 && (
  <Polygon
    positions={vertices}
    pathOptions={{
      color: '#f97316',
      fillOpacity: 0.45
    }}
  />
)}

{vertices.map((p, i) => (
  <CircleMarker
    key={i}
    center={p}
    radius={5}
    pathOptions={{
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 1
    }}
  />
))}
   </MapContainer>

{mensajeLimite && (
 <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[9999] text-orange-500 text-sm font-medium">
    Límite máximo de 10 puntos alcanzado
  </div>
)}

</div>
)
}