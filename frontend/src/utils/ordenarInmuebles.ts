import { CriterioOrdenamiento, DireccionOrdenamiento, Inmueble } from '../types/inmueble'

export const ordenarInmuebles = (
  inmuebles: Inmueble[],
  criterio: CriterioOrdenamiento,
  direccion: DireccionOrdenamiento
): Inmueble[] => {
  if (!criterio) return inmuebles // Retornar si no hay criterio de orden (por defecto)

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
