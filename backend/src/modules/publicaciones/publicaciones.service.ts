import { publicacionesRepository } from './publicaciones.repository.js'
import { Publicacion } from '@prisma/client'

export const publicacionesService = {
  async listarTodas(): Promise<Publicacion[]> {
    return publicacionesRepository.findAll()
  },

  async listarGratis(): Promise<Publicacion[]> {
    return publicacionesRepository.findGratis()
  },

  async crear(userId: number, data: Partial<Publicacion>): Promise<Publicacion> {
    const count = await publicacionesRepository.countByUser(userId)

    console.log('📊 Publicaciones del usuario:', count)

    if (count >= 2) {
      throw new Error('LIMIT_REACHED')
    }

    return publicacionesRepository.create(userId, data as Omit<Publicacion, 'id' | 'usuarioId'>)
  },

  async validarFlujo(userId: number): Promise<string> {
    const count = await publicacionesRepository.countByUser(userId)

    console.log('🔍 Validando flujo, publicaciones:', count)

    if (count >= 2) {
      throw new Error('LIMIT_REACHED')
    }

    return 'FLOW_ALLOWED'
  }
}
