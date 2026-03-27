import { useState, useMemo } from 'react'
import { CriterioOrdenamiento, DireccionOrdenamiento, Inmueble } from '../types/inmueble'
import { ordenarInmuebles } from '../utils/ordenarInmuebles'

interface UseOrdenamientoProps {
  inmueblesIniciales: Inmueble[]
}

export const useOrdenamiento = ({ inmueblesIniciales }: UseOrdenamientoProps) => {
  // Estado por defecto: Más recientes (Fecha desc)
  const [criterio, setCriterio] = useState<CriterioOrdenamiento>('fechaPublicacion')
  const [direccion, setDireccion] = useState<DireccionOrdenamiento>('desc')

  // Actualizar el estado de ordenamiento
  const cambiarOrden = (
    nuevoCriterio: CriterioOrdenamiento,
    nuevaDireccion: DireccionOrdenamiento
  ) => {
    setCriterio(nuevoCriterio)
    setDireccion(nuevaDireccion)
  }

  // Se aplica sobre los inmuebles que se pasan al hook
  // (esto garantiza que actúe sobre data ya filtrada visualmente y sea performante)
  const inmueblesOrdenados = useMemo(() => {
    return ordenarInmuebles(inmueblesIniciales, criterio, direccion)
  }, [inmueblesIniciales, criterio, direccion])

  return {
    criterio,
    direccion,
    cambiarOrden,
    inmueblesOrdenados
  }
}
