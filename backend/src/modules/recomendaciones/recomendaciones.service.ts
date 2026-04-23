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

  async getRecomendacionesPorPopularidad(zona: string, limit: number = 20, usuarioId?: number) {
    const populares = await this.repository.getInmueblesPopularesPorZona(zona, limit, usuarioId)
    return populares.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      precio: Number(p.precio),
      superficieM2: p.superficieM2 ? Number(p.superficieM2) : null,
      categoria: p.categoria ?? null,
      ubicacion: p.ubicacion,
      score: 50,
      razones: [`Popular en ${zona} (últimos 7 días)`]
    }))
  }

  async getRecomendacionesGlobales(params: RecomendacionesParams): Promise<InmuebleConScore[]> {
    const { usuarioId, limit = 20, excludeIds = [], zonaForzada } = params

    const zonaConexion = await this.repository.getZonaConexionUsuario(usuarioId)
    const historialVistas = await this.repository.getHistorialVistas(usuarioId)
    const ultimasBusquedas = await this.repository.getUltimasBusquedas(usuarioId)
    const favoritos = await this.repository.getFavoritos(usuarioId)

    console.log('usuarioId:', usuarioId)
    console.log('historialVistas.length:', historialVistas.length)
    console.log('favoritos.length:', favoritos.length)
    console.log('zonaConexion:', zonaConexion)

    if (historialVistas.length === 0 && favoritos.length === 0) {
      const zonaAEvaluar = zonaForzada || zonaConexion
      if (zonaAEvaluar) {
        return await this.getRecomendacionesPorPopularidad(zonaAEvaluar, limit, usuarioId)
      }
      const populares = await this.repository.getInmueblesPopulares(limit)
      return populares.map((p) => ({
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

    if (zonaConexion) {
      const totalRequeridos = limit
      const minDeZona = Math.ceil(totalRequeridos * 0.6)

      const deZonaConexion = candidatos.filter((c) =>
        c.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      )
      const otrasZonas = candidatos.filter(
        (c) => !c.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      )

      if (deZonaConexion.length < minDeZona) {
        const adicionales = await this.repository.getInmueblesPorZona(
          zonaConexion,
          minDeZona - deZonaConexion.length
        )
        candidatos = [...deZonaConexion, ...otrasZonas, ...adicionales]
      } else {
        candidatos = [...deZonaConexion, ...otrasZonas]
      }
    }

    candidatos = candidatos.filter((c) => !excludeIds.includes(c.id))

    const inmueblesConScore: InmuebleConScore[] = []

    for (const inmueble of candidatos) {
      const esSimilarAFavorito = favoritos.some(
        (f) => f.categoria === inmueble.categoria || f.ubicacion?.zona === inmueble.ubicacion?.zona
      )

      const { score, razones } = this.scoreCalculator.calcularScore(
        inmueble,
        preferencias,
        esSimilarAFavorito
      )

      let scoreFinal = score
      if (
        zonaConexion &&
        inmueble.ubicacion?.zona?.toLowerCase().includes(zonaConexion.toLowerCase())
      ) {
        scoreFinal += 10
        razones.push(`Zona de conexión (${zonaConexion}) +10pts`)
      }

      if (scoreFinal > 0) {
        inmueblesConScore.push({
          id: inmueble.id,
          titulo: inmueble.titulo,
          precio: Number(inmueble.precio),
          superficieM2: inmueble.superficieM2 ? Number(inmueble.superficieM2) : null,
          categoria: inmueble.categoria ?? null,
          ubicacion: inmueble.ubicacion,
          score: scoreFinal,
          razones
        })
      }
    }

    inmueblesConScore.sort((a, b) => b.score - a.score)
    return inmueblesConScore.slice(0, limit)
  }
}
