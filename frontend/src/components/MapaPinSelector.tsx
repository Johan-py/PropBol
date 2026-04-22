'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'

export default function MapaPinSelector() {
  return (
    <MapContainer
      center={[-17.3895, -66.1568]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '220px', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}