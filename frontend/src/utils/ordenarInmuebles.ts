import { CriterioOrdenamiento, DireccionOrdenamiento, Inmueble } from '../types/inmueble'

/**
 * Tarea 4: Función para ordenar por fecha (más reciente a más antiguo)
 */
export const ordenarPorFecha = (inmuebles: Inmueble[]): Inmueble[] => {
  return [...inmuebles].sort((a, b) => {
    return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
  })
}

export const ordenarInmuebles = (
  inmuebles: Inmueble[],
  criterio: CriterioOrdenamiento,
  direccion: DireccionOrdenamiento
): Inmueble[] => {
  if (!criterio) return inmuebles // Retornar si no hay criterio de orden (por defecto)

  // Integración Tarea 4: Ordenar por fecha descendente
  if (criterio === 'fechaPublicacion' && direccion === 'desc') {
    return ordenarPorFecha(inmuebles)
  }

  // Crear una nueva refencia para no mutar el array original
  return [...inmuebles].sort((a, b) => {
    let valorA = a[criterio]
    let valorB = b[criterio]

    // Manejar fechas (convertimos a timestamps temporalmente)
    if (criterio === 'fechaPublicacion') {
      valorA = new Date(valorA as string).getTime()
      valorB = new Date(valorB as string).getTime()
    }

    if (valorA < valorB) {
      return direccion === 'asc' ? -1 : 1
    }
    if (valorA > valorB) {
      return direccion === 'asc' ? 1 : -1
    }
    return 0
  })
}
