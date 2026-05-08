export interface MisPublicacionesItem {
  id: number
  titulo: string
  precio: number
  ubicacion: string
  nroBanos: number | null
  nroCuartos: number | null
  superficieM2: number | null
  imagenUrl: string | null
  tipoOperacion?: string
  activa?: boolean
  metricas?: {
    visitas: number
    favoritos: number
    contactos: number
  }
}

export interface FormPublicar {
  titulo: string
  tipoPropiedad: string
  precio: string
  superficie: string
  habitaciones: string
  banos: string
  direccion: string
  ciudad: string
  codigoPostal: string
  descripcion: string
}

export interface ErrorValidacion {
  campo: keyof FormPublicar
  seccion: 'Información Básica' | 'Características' | 'Ubicación' | 'Detalles'
  mensaje: string
}

export type EstadoPublicacion =
  | 'idle'
  | 'validando'
  | 'errores'
  | 'confirmando'
  | 'publicando'
  | 'exito'
  | 'error_publicacion'

export interface PublicacionImagen {
  id: number
  url: string
  tipo: string
  pesoMb: number | null
}

export interface PublicacionDetalle {
  id: number
  titulo: string
  descripcion: string
  precio: number
  tipoOperacion: 'VENTA' | 'ALQUILER' | 'ANTICRETO'
  ubicacionTexto: string
  imagenes: PublicacionImagen[]
  videoUrl?: string | null
}

export interface EditarPublicacionPayload {
  titulo: string
  descripcion: string
  precio: number
  tipoAccion: 'VENTA' | 'ALQUILER' | 'ANTICRETO'
  ubicacion: string
}