import { Matrix } from 'ml-matrix'
import { prisma } from '../../lib/prisma.client.js'

// ── Vector de características de un inmueble ──────────────────────────────────
// Cada inmueble se representa como 5 números entre 0 y 1.
export interface FeatureVector {
  inmuebleId: number
  vector: number[]  // [precio, superficie, cuartos, banos, categoria]
}

// Categorías mapeadas a números
const CATEGORIA_MAP: Record<string, number> = {
  CASA:              0.2,
  DEPARTAMENTO:      0.4,
  CUARTO:            0.6,
  TERRENO:           0.8,
  OFICINA:           0.9,
  TERRENO_MORTUORIO: 1.0,
}

export class FeaturesService {

  // ── Normalizar un valor entre 0 y 1 ─────────────────────────────────────────
  private normalizar(valor: number, min: number, max: number): number {
    if (max === min) return 0
    return Math.max(0, Math.min(1, (valor - min) / (max - min)))
  }

  // ── Construir vector de un inmueble ──────────────────────────────────────────
  construirVector(
    inmueble: any,
    stats: { minPrecio: number; maxPrecio: number; minSup: number; maxSup: number }
  ): number[] {
    return [
      this.normalizar(Number(inmueble.precio || 0), stats.minPrecio, stats.maxPrecio),
      this.normalizar(Number(inmueble.superficieM2 || 0), stats.minSup, stats.maxSup),
      this.normalizar(Number(inmueble.nroCuartos || 0), 0, 10),
      this.normalizar(Number(inmueble.nroBanos || 0), 0, 5),
      CATEGORIA_MAP[String(inmueble.categoria || 'CASA').toUpperCase()] ?? 0.2,
    ]
  }

  // ── Similitud de coseno entre dos vectores ───────────────────────────────────
  // Devuelve un número entre 0 (nada similar) y 1 (idénticos)
  similitudCoseno(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    if (magnitudA === 0 || magnitudB === 0) return 0
    return dotProduct / (magnitudA * magnitudB)
  }

  // ── Obtener estadísticas globales para normalización ─────────────────────────
  async obtenerStats() {
    const stats = await prisma.inmueble.aggregate({
      where: { estado: 'ACTIVO' },
      _min: { precio: true, superficieM2: true },
      _max: { precio: true, superficieM2: true },
    })
    return {
      minPrecio: Number(stats._min.precio || 0),
      maxPrecio: Number(stats._max.precio || 1000000),
      minSup:    Number(stats._min.superficieM2 || 0),
      maxSup:    Number(stats._max.superficieM2 || 1000),
    }
  }

  // ── Calcular el vector de preferencias del usuario ───────────────────────────
  // Es el PROMEDIO de los vectores de los inmuebles que vio/favoritó
  async calcularPerfilUsuario(usuarioId: number, stats: any): Promise<number[] | null> {
    // Tomar los últimos 20 inmuebles visitados
    const vistas = await prisma.propiedad_vista.findMany({
      where: { usuarioId },
      include: { inmueble: true },
      orderBy: { vistaEn: 'desc' },
      take: 20,
    })

    // Tomar favoritos
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      include: { inmueble: true },
      orderBy: { agregadoEn: 'desc' },
      take: 10,
    })

    const inmuebles = [
      ...favoritos.map(f => ({ ...f.inmueble, peso: 2 })), // favoritos pesan doble
      ...vistas.map(v => ({ ...v.inmueble, peso: 1 })),
    ]

    if (inmuebles.length === 0) return null

    // Calcular vector promedio ponderado
    const vectores = inmuebles.map(i => ({
      vector: this.construirVector(i, stats),
      peso: i.peso,
    }))

    const pesoTotal = vectores.reduce((sum, v) => sum + v.peso, 0)
    const perfilVector = [0, 0, 0, 0, 0]

    for (const { vector, peso } of vectores) {
      for (let i = 0; i < 5; i++) {
        perfilVector[i] += (vector[i] * peso) / pesoTotal
      }
    }

    return perfilVector
  }

  // ── Recomendar inmuebles por similitud de coseno ─────────────────────────────
  // Compara el perfil del usuario contra todos los inmuebles disponibles
  // y devuelve los más similares ordenados por score
  async recomendar(usuarioId: number, limit: number = 20): Promise<any[]> {
    const stats = await this.obtenerStats()

    const perfilUsuario = await this.calcularPerfilUsuario(usuarioId, stats)

    // Si no tiene historial, devolver null (el servicio usará populares como fallback)
    if (!perfilUsuario) return []

    const vistasIds = await prisma.propiedad_vista.findMany({
      where: { usuarioId },
      select: { inmuebleId: true },
    })
    const idsExcluir = new Set(vistasIds.map(v => v.inmuebleId))

    const candidatos = await prisma.inmueble.findMany({
      where: {
        estado: 'ACTIVO',
        id: { notIn: Array.from(idsExcluir) },
      },
      include: { ubicacion: true },
      take: 200, 
    })

    // Calcular similitud de coseno para cada candidato
    const conScore = candidatos.map(inmueble => {
      const vectorInmueble = this.construirVector(inmueble, stats)
      const score = this.similitudCoseno(perfilUsuario, vectorInmueble)
      return {
        ...inmueble,
        score: Math.round(score * 100) / 100,
        razones: this.generarRazones(perfilUsuario, vectorInmueble, inmueble),
      }
    })

    // Ordenar por score y devolver top N
    return conScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // ── Generar razones legibles del score ─────────────────
  private generarRazones(perfil: number[], vector: number[], inmueble: any): string[] {
    const razones: string[] = []
    const dims = [
      { nombre: 'Precio',      idx: 0 },
      { nombre: 'Superficie',  idx: 1 },
      { nombre: 'Dormitorios', idx: 2 },
      { nombre: 'Baños',       idx: 3 },
      { nombre: 'Categoría',   idx: 4 },
    ]
    for (const dim of dims) {
      const diff = Math.abs(perfil[dim.idx] - vector[dim.idx])
      if (diff < 0.15) razones.push(`✓ ${dim.nombre} similar a tus preferencias`)
    }
    if (razones.length === 0) razones.push('Recomendado por tendencia general')
    return razones
  }
}

export const featuresService = new FeaturesService()