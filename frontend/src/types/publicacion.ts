export interface MisPublicacionesItem {
  id: number
  titulo: string
  precio: number
  ubicacion: string
  nroBanos: number | null
  nroCuartos: number | null
  superficieM2: number | null
  imagenUrl: string | null
}


export interface FormPublicar {
  titulo: string;
  tipoPropiedad: string;
  precio: string;
  superficie: string;
  habitaciones: string;
  banos: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  descripcion: string;
}

export interface ErrorValidacion {
  campo: keyof FormPublicar;
  seccion: "Información Básica" | "Características" | "Ubicación" | "Detalles";
  mensaje: string;
}

export type EstadoPublicacion =
  | "idle"
  | "validando"
  | "errores"
  | "confirmando"
  | "publicando"
  | "exito"
  | "error_publicacion";