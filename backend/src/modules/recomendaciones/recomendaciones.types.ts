export interface InmuebleConScore {
  id: number
  titulo: string
  precio: number
  superficieM2: number | null
  categoria: string | null
  ubicacion: {
    zona: string | null
    ciudad: string | null
  } | null
  score: number
  razones: string[] // Para debugging
}

export interface HistorialVista {
  inmuebleId: number
  vistaEn: Date
  peso: number // 1.0 para últimos 7 días, menor para más antiguos
}

export interface PreferenciasUsuario {
  zonasPreferidas: Map<string, number> // zona -> peso
  categoriasPreferidas: Map<string, number> // categoria -> peso
  rangoPrecio: { min: number; max: number } | null
  rangoSuperficie: { min: number; max: number } | null
  ultimasBusquedas: string[]
  totalClics: number
}

export interface RecomendacionesParams {
  usuarioId: number
  limit?: number
  excludeIds?: number[] // Inmuebles a excluir
  zonaForzada?: string // Para forzar 60% de una zona
}
