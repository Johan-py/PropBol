export interface Inmueble {
  id: number;
  titulo: string;
  precio: number;
  superficie: number;
  ubicacion: string;
  habitaciones: number;
  banos: number;
  fechaPublicacion: string; // YYYY-MM-DD
  popularidad: number;
}

export type CriterioOrden Fecha = 'fechaPublicacion' | 'popularidad';
export type CriterioOrdenMetrica = 'precio' | 'superficie';

export type CriterioOrdenamiento = CriterioOrdenFecha | CriterioOrdenMetrica | null;
export type DireccionOrdenamiento = 'asc' | 'desc';

export interface OpcionOrden {
  label: string;
  criterio: CriterioOrdenamiento;
  direccion: DireccionOrdenamiento;
}
