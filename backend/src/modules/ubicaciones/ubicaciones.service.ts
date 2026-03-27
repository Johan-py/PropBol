import { UbicacionesRepository } from './ubicaciones.repository.js'

export class UbicacionesService {
  private repository = new UbicacionesRepository()

  async registrarConsulta(id: number) {
    if (!id) throw new Error('ID de ubicación inválido')
    return await this.repository.incrementarPopularidad(id)
  }
}
