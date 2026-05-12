'use client'
import ComoLlegarButton from '@/components/galeria/ComoLlegarButton'

interface Props {
  mapa: {
    latitud: number | null
    longitud: number | null
    direccion: string | null
  }
}

export default function UbicacionPropiedad({ mapa }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-[18px] font-bold text-[#1f1f1f] md:text-[20px]">Ubicación</h2>

      <div className="overflow-hidden rounded-2xl border border-[#beb4a8] bg-[#dbe8d7]">
        {mapa.latitud !== null && mapa.longitud !== null ? (
          <div className="flex h-[290px] items-center justify-center px-6 text-center text-[#2c2824]">
            <div>
              <p className="text-lg font-semibold">Mapa pendiente de integración</p>
              <p className="mt-2 text-sm">Lat: {mapa.latitud}</p>
              <p className="text-sm">Lng: {mapa.longitud}</p>
              {mapa.direccion && <p className="mt-3 text-sm">{mapa.direccion}</p>}
            </div>
          </div>
        ) : (
          <div className="flex h-[290px] items-center justify-center text-[#5f5a54]">
            Ubicación no disponible
          </div>
        )}
      </div>
      {/* HU13 #71 - Boton Como llegar en detalle de publicacion seccion ubicacion */}
      <div className="mt-3 w-full min-h-[44px] flex items-center">
        <ComoLlegarButton
          lat={mapa.latitud}
          lng={mapa.longitud}
          variant="grid"
          aria-label="Calcular ruta hacia esta propiedad"
        />
      </div>
    </section>
  )
}
