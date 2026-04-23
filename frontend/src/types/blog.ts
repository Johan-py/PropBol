export type BlogStatus = 'Aprobado' | 'Pendiente' | 'Rechazado' | 'Borrador'

export interface Blog {
  id: string
  titulo: string
  fecha: string
  estado: BlogStatus
  imagenUrl: string
  autor?: string
  resumen?: string
}
