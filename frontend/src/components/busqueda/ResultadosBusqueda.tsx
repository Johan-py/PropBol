'use client'

import { useMemo, useState } from 'react'
import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { mockInmuebles } from '../../lib/mock/inmuebles.mock'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'
import { Inmueble } from '../../types/inmueble'

// Simulación de filtros (para futura integración)
interface FiltrosActivos {
  precioMin?: number
  precioMax?: number
  zona?: string
}

export const ResultadosBusqueda = () => {
  // Estado de filtros (para futura integración)
  const [filtros] = useState<FiltrosActivos>({})

  // Simular filtrado de inmuebles
  const inmueblesFiltrados = useMemo<Inmueble[]>(() => {
    let resultado = [...mockInmuebles]

    if (filtros.precioMin !== undefined) {
      resultado = resultado.filter((i) => i.precio >= filtros.precioMin!)
    }
    if (filtros.precioMax !== undefined) {
      resultado = resultado.filter((i) => i.precio <= filtros.precioMax!)
    }
    if (filtros.zona) {
      resultado = resultado.filter((i) =>
        i.ubicacion.toLowerCase().includes(filtros.zona!.toLowerCase())
      )
    }

    return resultado
  }, [filtros])

  // Hook de ordenamiento: recibe los inmuebles ya filtrados
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: inmueblesFiltrados
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Menu de Ordenamiento */}
      <MenuOrdenamiento
        ordenActual={ordenActual}
        onOrdenChange={cambiarOrden}
        totalResultados={inmueblesOrdenados.length}
      />

      {/* Grid de Resultados */}
      {inmueblesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {inmueblesOrdenados.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron propiedades con los filtros actuales.</p>
        </div>
      )}
    </div>
  )
}
