'use client'

import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"

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

// 🔥 arreglar iconos leaflet
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
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

            <FlyToZona zona={zonaActiva} />

            {/* 🔥 MARCADORES DE ZONAS */}
            {zonas.map((zona) => {
                if (!zona.coordenadas) return null

                return (
                    <Marker
                        key={zona.id}
                        position={[zona.coordenadas.lat, zona.coordenadas.lng]}
                        eventHandlers={{
                            click: () => onZonaClick(zona),
                        }}
                    >
                        <Popup>
                            <div>
                                <strong>{zona.nombre}</strong>
                                <br />
                                {zona.referencia}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}