export interface Plan {
  id: number;

  nombre: string;

  descripcion: string;

  precioMensual: number;

  limitePublicaciones: number;

  vigenciaDias: number;

  estado: "ACTIVO" | "INACTIVO";

  eliminado: boolean;

  createdAt: string;

  updatedAt: string;
}
