'use client'

import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { mockInmuebles } from '../../lib/mock/inmuebles.mock'
import { BarraOrdenamiento } from './ordenamiento/BarraOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'

export const ResultadosBusqueda = () => {
  const { criterio, direccion, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmueblesIniciales: mockInmuebles
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Selector de Orden */}
      <BarraOrdenamiento
        criterio={criterio}
        direccion={direccion}
        onChange={cambiarOrden}
        itemsCount={inmueblesOrdenados.length}
      />

      {/* Grid de Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {inmueblesOrdenados.map((inmueble) => (
          <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
        ))}
      </div>
    </div>
  )
}
