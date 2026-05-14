'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

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
  pois: {
  id: number
  nombre: string
  lat: number
  lng: number
}[]
setPois: React.Dispatch<
  React.SetStateAction<
    {
      id: number
      nombre: string
      lat: number
      lng: number
    }[]
  >
>
poiSeleccionado: number | null
setPoiSeleccionado: (v: number | null) => void
}

function EventosMapa({
  modoPinActivo,
  modoDifuminadoActivo,
  setPinCoords,
  vertices,
  setVertices
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
  modoDifuminadoActivo,
  pois,
  setPois,
  poiSeleccionado,
  setPoiSeleccionado
}: Props) {
 const offsets = [
  [0, -40],
  [40, 0],
  [0, 40],
  [-40, 0]
]
 
  return (
    <MapContainer
      center={[-17.3895, -66.1568]}
      zoom={13}
      scrollWheelZoom
      style={{ height: '320px', width: '100%' }}
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
      />

     {pinCoords && (
  <Marker
    position={[pinCoords.lat, pinCoords.lng]}
    icon={pinIcon}
    draggable={false}
  />
)}

{pois.map((poi, i) => (
  <CircleMarker
    key={poi.id}
    center={[poi.lat, poi.lng]}
    radius={1}
    opacity={0}
    fillOpacity={0}
  >
    <Tooltip
      permanent
      interactive={true}
      sticky={false}
      direction="center"
      offset={[
        offsets[i % 4][0] + Math.floor(i / 4) * 15,
        offsets[i % 4][1] + Math.floor(i / 4) * 15
      ] as [number, number]}
      opacity={1}
      className="!bg-transparent !border-0 !shadow-none"
    >
      <input
        type="text"
        maxLength={20}
        value={poi.nombre ?? ''}
        placeholder="..."
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => setPoiSeleccionado(poi.id)}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const nuevosPois = [...pois]
          nuevosPois[i].nombre = e.target.value
          setPois(nuevosPois)
        }}
         className={`
  px-3
  py-1
  rounded-full
  text-[11px]
  bg-white
  border
  ${poiSeleccionado === poi.id ? 'border-red-500' : 'border-gray-300'}
  shadow-sm
  min-w-[70px]
  max-w-[90px]
  outline-none
  text-center
              `}
                />
             </Tooltip>
          </CircleMarker>
             ))}

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
  )
}
