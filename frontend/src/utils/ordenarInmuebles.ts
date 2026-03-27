import { Inmueble, EstadoOrdenamiento, OrdenDireccion } from '../types/inmueble'

/**
 * Ordena un array de inmuebles según el estado de ordenamiento.
 * Aplica ordenamiento simultáneo: Fecha → Precio → Superficie
 *
 * @param inmuebles - Array de inmuebles a ordenar
 * @param estado - Estado de ordenamiento con fecha, precio y superficie
 * @returns Nuevo array ordenado
 */
export const ordenarInmuebles = (inmuebles: Inmueble[], estado: EstadoOrdenamiento): Inmueble[] => {
  if (!inmuebles || inmuebles.length === 0) {
    return []
  }

  return [...inmuebles].sort((a, b) => {
    // 1. Ordenar por fecha/popularidad (criterio primario)
    const comparacionFecha = compararPorFecha(a, b, estado.fecha)
    if (comparacionFecha !== 0) return comparacionFecha

    // 2. Ordenar por precio (criterio secundario)
    const comparacionPrecio = compararNumerico(a.precio, b.precio, estado.precio)
    if (comparacionPrecio !== 0) return comparacionPrecio

    // 3. Ordenar por superficie (criterio terciario)
    return compararNumerico(a.superficie, b.superficie, estado.superficie)
  })
}

/**
 * Compara dos inmuebles por fecha o popularidad
 */
function compararPorFecha(
  a: Inmueble,
  b: Inmueble,
  criterio: 'mas-recientes' | 'mas-populares'
): number {
  if (criterio === 'mas-recientes') {
    const fechaA = new Date(a.fechaPublicacion).getTime()
    const fechaB = new Date(b.fechaPublicacion).getTime()
    return fechaB - fechaA // Descendente (más recientes primero)
  } else {
    return b.popularidad - a.popularidad // Descendente (más populares primero)
  }
}

/**
 * Compara dos valores numéricos con dirección
 */
function compararNumerico(valorA: number, valorB: number, direccion: OrdenDireccion): number {
  if (direccion === 'menor-a-mayor') {
    return valorA - valorB
  } else {
    return valorB - valorA
  }
}

/**
 * Versión simplificada para ordenar por un solo criterio
 * (mantiene compatibilidad con código legado)
 */
export const ordenarPorCriterio = (
  inmuebles: Inmueble[],
  criterio: 'fecha' | 'popularidad' | 'precio' | 'superficie',
  ascendente: boolean = true
): Inmueble[] => {
  if (!inmuebles || inmuebles.length === 0) {
    return []
  }

  return [...inmuebles].sort((a, b) => {
    let valorA: number
    let valorB: number

    switch (criterio) {
      case 'fecha':
        valorA = new Date(a.fechaPublicacion).getTime()
        valorB = new Date(b.fechaPublicacion).getTime()
        break
      case 'popularidad':
        valorA = a.popularidad
        valorB = b.popularidad
        break
      case 'precio':
        valorA = a.precio
        valorB = b.precio
        break
      case 'superficie':
        valorA = a.superficie
        valorB = b.superficie
        break
      default:
        return 0
    }

    return ascendente ? valorA - valorB : valorB - valorA
  })
}
