export interface Inmueble {
  id: number
  titulo: string
  precio: number
  superficie: number
  ubicacion: string
  habitaciones: number
  banos: number
  fechaPublicacion: string // YYYY-MM-DD
  popularidad: number
}

// ─── Tipos de Ordenamiento ────────────────────────────────────────────────────

export type OrdenFecha = 'mas-recientes' | 'mas-populares'
export type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

export interface EstadoOrdenamiento {
  fecha: OrdenFecha
  precio: OrdenDireccion
  superficie: OrdenDireccion
}

// ─── Opciones disponibles ─────────────────────────────────────────────────────

export const OPCIONES_FECHA: Array<{ value: OrdenFecha; label: string }> = [
  { value: 'mas-recientes', label: 'Más recientes' },
  { value: 'mas-populares', label: 'Más populares' }
]

export const OPCIONES_DIRECCION: Array<{ value: OrdenDireccion; label: string }> = [
  { value: 'menor-a-mayor', label: 'Menor a Mayor' },
  { value: 'mayor-a-menor', label: 'Mayor a Menor' }
]

// ─── Estado por defecto ───────────────────────────────────────────────────────

export const ORDENAMIENTO_DEFAULT: EstadoOrdenamiento = {
  fecha: 'mas-recientes',
  precio: 'menor-a-mayor',
  superficie: 'menor-a-mayor'
}
