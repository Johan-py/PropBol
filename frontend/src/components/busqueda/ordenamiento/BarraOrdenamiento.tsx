'use client'

import { useMemo } from 'react'
import { Filter, X, BarChart2 } from 'lucide-react'
import { DropdownOrden } from './DropdownOrden'
import { CriterioOrdenamiento, DireccionOrdenamiento } from '../../../types/inmueble'

interface BarraOrdenamientoProps {
  criterio: CriterioOrdenamiento
  direccion: DireccionOrdenamiento
  onChange: (criterio: CriterioOrdenamiento, direccion: DireccionOrdenamiento) => void
  itemsCount: number
}

// Opciones estáticas del Dropdown de Fecha
const opcionesFecha = [
  { label: 'Más recientes', valor: 'fechaPublicacion_desc' },
  { label: 'Más antiguos', valor: 'fechaPublicacion_asc' },
  { label: 'Más populares', valor: 'popularidad_desc' }
]

// Opciones estáticas del Dropdown de Métricas
const opcionesMetricas = [
  { label: 'Superficie: Menor a Mayor', valor: 'superficie_asc' },
  { label: 'Superficie: Mayor a Menor', valor: 'superficie_desc' },
  { label: 'Precio: Menor a Mayor', valor: 'precio_asc' },
  { label: 'Precio: Mayor a Menor', valor: 'precio_desc' }
]

export const BarraOrdenamiento = ({
  criterio,
  direccion,
  onChange,
  itemsCount
}: BarraOrdenamientoProps) => {
  // Componer un identificador único del estado actual para enlazar con los dropdowns
  const valorActualizado = useMemo(() => {
    if (!criterio) return ''
    return `${criterio}_${direccion}`
  }, [criterio, direccion])

  // Manejador que parsea la selección y emite el evento al hook
  const handleDropdownChange = (valor: string) => {
    const [nuevoCriterio, nuevaDireccion] = valor.split('_') as [
      CriterioOrdenamiento,
      DireccionOrdenamiento
    ]
    onChange(nuevoCriterio, nuevaDireccion)
  }

  return (
    <div className="flex flex-col items-start bg-transparent w-full gap-6 mb-6">
      {/* Título Principal */}
      <div className="flex items-center gap-2">
        <Filter className="w-8 h-8 text-orange-500 fill-transparent" strokeWidth={2} />
        <h1 className="text-2xl font-bold text-gray-900">Resultados de búsqueda</h1>
      </div>

      {/* Chips de Filtros Activos Simulados */}
      <div className="flex flex-wrap items-center gap-3 w-full">
        <span className="text-sm font-medium text-gray-500">Activos:</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-500 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
            $50k - $450k
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-orange-700" />
          </div>
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-500 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm">
            Casas
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-orange-700" />
          </div>
        </div>
      </div>

      {/* Sección Ordenar por */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-gray-500 rotate-90" strokeWidth={2} />
          <span className="text-gray-500 font-medium">Ordenar por:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl pl-1 sm:pl-7">
          {/* Dropdown Fecha */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-gray-500">Fecha:</label>
            <DropdownOrden
              label="Seleccionar"
              opciones={opcionesFecha}
              valorActual={
                opcionesFecha.some((opt) => opt.valor === valorActualizado) ? valorActualizado : ''
              }
              onChange={handleDropdownChange}
            />
          </div>

          {/* Dropdown Métricas */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-gray-500">Métricas:</label>
            <DropdownOrden
              label="Seleccionar"
              opciones={opcionesMetricas}
              valorActual={
                opcionesMetricas.some((opt) => opt.valor === valorActualizado)
                  ? valorActualizado
                  : ''
              }
              onChange={handleDropdownChange}
            />
          </div>
        </div>
      </div>

      {/* Contador de propiedades */}
      <div className="mt-2 text-sm font-medium">
        <span className="text-orange-500 font-bold">{itemsCount}</span>
        <span className="text-gray-500 ml-1">propiedades encontradas</span>
      </div>
    </div>
  )
}
