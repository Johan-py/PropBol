'use client'

import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"

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

function FlyToZona({ zona }: { zona: Zona | null }) {
    const map = useMap()

    useEffect(() => {
        if (!zona?.coordenadas) return

        map.flyTo(
            [zona.coordenadas.lat, zona.coordenadas.lng],
            zona.coordenadas.zoom ?? 14,
            { duration: 0.8 }
        )
    }, [zona, map])

    return null
}

export default function MapaZonas({
    zonas: _zonas,
    zonaActiva,
    onZonaClick: _onZonaClick,
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

            <FlyToZona zona={zonaActiva} />
        </MapContainer>
    )
}