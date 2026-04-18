'use client'

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer } from "react-leaflet"

interface Zona {
    id: number
    nombre: string
    referencia: string
    activa: boolean
    coordenadas?: { lat: number; lng: number; zoom: number }
}

interface MapaZonasProps {
    zonas: Zona[]
    zonaActiva: Zona | null
    onZonaClick: (zona: Zona) => void
}

export default function MapaZonas({
    zonas,
    zonaActiva,
    onZonaClick,
}: MapaZonasProps) {

    const center: [number, number] = [-17.3895, -66.1568]

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    )
}