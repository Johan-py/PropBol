export type BlogStatus =
  | 'Aprobado'
  | 'Pendiente'
  | 'Rechazado'
  | 'Borrador'
  | 'PUBLICADO'
  | 'PENDIENTE'
  | 'RECHAZADO'
  | 'BORRADOR'

export interface Blog {
  id: number
  titulo: string
  fecha: string
  estado: BlogStatus
  imagenUrl: string
  autor?: string
  resumen?: string
}
