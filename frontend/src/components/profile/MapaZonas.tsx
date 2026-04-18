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

// 🔧 Fix iconos leaflet
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
}

// 🧪 PROPIEDADES MOCK
const PROPIEDADES_MOCK: Propiedad[] = [
    { id: 1, titulo: "Casa amplia zona norte", precio: "$85,000", tipo: "Casa", lat: -17.387, lng: -66.154, zonaId: 1 },
    { id: 2, titulo: "Departamento moderno", precio: "$45,000", tipo: "Departamento", lat: -17.391, lng: -66.159, zonaId: 1 },
    { id: 3, titulo: "Terreno en esquina", precio: "$30,000", tipo: "Terreno", lat: -17.393, lng: -66.152, zonaId: 1 },
    { id: 4, titulo: "Casa con jardín", precio: "$95,000", tipo: "Casa", lat: -17.403, lng: -66.140, zonaId: 2 },
    { id: 5, titulo: "Departamento 3 dorm.", precio: "$55,000", tipo: "Departamento", lat: -17.408, lng: -66.145, zonaId: 2 },
    { id: 6, titulo: "Oficina céntrica", precio: "$40,000", tipo: "Oficina", lat: -17.405, lng: -66.142, zonaId: 2 },
]

// 🎨 colores por tipo
const COLORES_TIPO: Record<string, string> = {
    Casa: "#3b82f6",
    Departamento: "#8b5cf6",
    Terreno: "#f59e0b",
    Oficina: "#10b981",
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

// 🎨 ICONO ZONA
function createZonaIcon(activa: boolean): L.DivIcon {
    const color = activa ? "#f59e0b" : "#6b7280"

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

// 🎨 ICONO PROPIEDAD
function createPropiedadIcon(tipo: string): L.DivIcon {
    const color = COLORES_TIPO[tipo] || "#6b7280"

    return L.divIcon({
        className: "",
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
      ">
        ${tipo}
      </div>
    `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
    })
}

export default function MapaZonas({
    zonas,
    zonaActiva,
    onZonaClick,
}: MapaZonasProps) {

    const center: [number, number] = [-17.3895, -66.1568]

    // 🔥 filtrar propiedades según zona activa
    const propiedades = zonaActiva
        ? PROPIEDADES_MOCK.filter(p => p.zonaId === zonaActiva.id)
        : []

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

            {/* 🔥 ZONAS */}
            {zonas.map((zona) => {
                if (!zona.coordenadas) return null

                const esActiva = zonaActiva?.id === zona.id

                return (
                    <Marker
                        key={zona.id}
                        position={[zona.coordenadas.lat, zona.coordenadas.lng]}
                        icon={createZonaIcon(esActiva)}
                        eventHandlers={{ click: () => onZonaClick(zona) }}
                    >
                        <Popup>
                            <div>
                                <strong>{zona.nombre}</strong>
                                <br />
                                {zona.referencia}
                                {esActiva && (
                                    <div style={{ color: "#f59e0b" }}>Zona activa</div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}

            {/* 🔥 PROPIEDADES */}
            {propiedades.map((prop) => (
                <Marker
                    key={prop.id}
                    position={[prop.lat, prop.lng]}
                    icon={createPropiedadIcon(prop.tipo)}
                >
                    <Popup>
                        <div>
                            <strong>{prop.titulo}</strong>
                            <br />
                            <span style={{ color: "#f59e0b" }}>{prop.precio}</span>
                            <br />
                            <small>{prop.tipo}</small>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}