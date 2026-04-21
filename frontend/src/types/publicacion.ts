export interface MisPublicacionesItem {
  id: number
  titulo: string
  precio: number
  estado: "ACTIVA" | "INACTIVA"
  ubicacion: string
  nroBanos: number | null
  nroCuartos: number | null
  superficieM2: number | null
  imagenUrl: string | null
}
