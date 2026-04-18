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

// 🔧 Fix iconos leaflet
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
}

// 🚀 FlyTo
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

// 🎨 ICONO PERSONALIZADO
function createZonaIcon(activa: boolean): L.DivIcon {
    const color = activa ? "#f59e0b" : "#6b7280" // amarillo vs gris

    return L.divIcon({
        className: "",
        html: `
      <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        <div style="
          width:18px;height:18px;
          border-radius:50%;
          background:${color};
          border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    })
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

            {/* 🔥 MARCADORES */}
            {zonas.map((zona) => {
                if (!zona.coordenadas) return null

                const esActiva = zonaActiva?.id === zona.id

                return (
                    <Marker
                        key={zona.id}
                        position={[zona.coordenadas.lat, zona.coordenadas.lng]}
                        icon={createZonaIcon(esActiva)}
                        eventHandlers={{
                            click: () => onZonaClick(zona),
                        }}
                    >
                        <Popup>
                            <div>
                                <strong>{zona.nombre}</strong>
                                <br />
                                {zona.referencia}
                                {esActiva && (
                                    <div style={{ color: "#f59e0b", marginTop: "4px" }}>
                                        Zona activa
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}