export interface MisPublicacionesItem {
  id: number;
  titulo: string;
  precio: number;
  ubicacion: string;
  nroBanos: number | null;
  nroCuartos: number | null;
  superficieM2: number | null;
  imagenUrl: string | null;
  tipoOperacion?: string;
  activa?: boolean;
}

export interface PublicacionDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  tipoOperacion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacionTexto: string;
  imagenes: Array<{
    id: number;
    url: string;
    tipo: string;
    pesoMb: number | null;
  }>;
}

export interface EditarPublicacionPayload {
  titulo: string;
  descripcion: string;
  precio: number;
  tipoAccion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacion: string;
}

export interface PublicacionDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  tipoOperacion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacionTexto: string;
  imagenes: Array<{
    id: number;
    url: string;
    tipo: string;
    pesoMb: number | null;
  }>;
}

export interface EditarPublicacionPayload {
  titulo: string;
  descripcion: string;
  precio: number;
  tipoAccion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacion: string;
}
