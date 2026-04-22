import { RecomendacionesRepository } from './recomendaciones.repository.js'
import { ScoreCalculator } from './recomendaciones.utils.js'
import { RecomendacionesParams, InmuebleConScore } from './recomendaciones.types.js'

export class RecomendacionesService {
  private repository: RecomendacionesRepository
  private scoreCalculator: ScoreCalculator

  constructor() {
    this.repository = new RecomendacionesRepository()
    this.scoreCalculator = new ScoreCalculator()
  }

  async getRecomendacionesGlobales(params: RecomendacionesParams): Promise<InmuebleConScore[]> {
    const { usuarioId, limit = 20, excludeIds = [] } = params

    const historialVistas = await this.repository.getHistorialVistas(usuarioId)
    const ultimasBusquedas = await this.repository.getUltimasBusquedas(usuarioId)
    const favoritos = await this.repository.getFavoritos(usuarioId)

    if (historialVistas.length === 0 && favoritos.length === 0) {
      const populares = await this.repository.getInmueblesPopulares(limit)
      return populares.map(p => ({
        id: p.id,
        titulo: p.titulo,
        precio: Number(p.precio),
        superficieM2: p.superficieM2 ? Number(p.superficieM2) : null,
        categoria: p.categoria ?? null,
        ubicacion: p.ubicacion,
        score: 50,
        razones: ['Popularidad general']
      }))
    }

    const preferencias = this.scoreCalculator.extraerPreferencias(
      historialVistas,
      ultimasBusquedas,
      favoritos
    )

    let candidatos = await this.repository.getInmueblesCandidatos(usuarioId, 100)
    candidatos = candidatos.filter(c => !excludeIds.includes(c.id))

    const inmueblesConScore: InmuebleConScore[] = []

    for (const inmueble of candidatos) {
      const esSimilarAFavorito = favoritos.some(f =>
        f.categoria === inmueble.categoria ||
        f.ubicacion?.zona === inmueble.ubicacion?.zona
      )

      const { score, razones } = this.scoreCalculator.calcularScore(
        inmueble,
        preferencias,
        esSimilarAFavorito
      )

      if (score > 0) {
        inmueblesConScore.push({
          id: inmueble.id,
          titulo: inmueble.titulo,
          precio: Number(inmueble.precio),
          superficieM2: inmueble.superficieM2 ? Number(inmueble.superficieM2) : null,
          categoria: inmueble.categoria ?? null,
          ubicacion: inmueble.ubicacion,
          score,
          razones
        })
      }
    }

    inmueblesConScore.sort((a, b) => b.score - a.score)
    return inmueblesConScore.slice(0, limit)
  }
}