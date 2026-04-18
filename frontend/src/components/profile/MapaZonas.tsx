'use client'

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
    return (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-500 text-sm">
            Mapa de zonas en construcción
        </div>
    )
}