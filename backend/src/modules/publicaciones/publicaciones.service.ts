import { publicacionesRepository } from './publicaciones.repository.js'
import { Publicacion } from '@prisma/client'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'

export const publicacionesService = {
  async listarTodas(): Promise<Publicacion[]> {
    return publicacionesRepository.findAll()
  },

  async listarGratis(): Promise<Publicacion[]> {
    return publicacionesRepository.findGratis()
  },

  async listarMisPublicaciones(userId: number) {
    return publicacionesRepository.findByUserId(userId)
  },

  async obtenerEstadisticasPublicaciones(userId: number) {
    const totalPublicaciones = await publicacionesRepository.countByUser(userId)
    const limite = await suscripcionesService.obtenerLimitePublicaciones(userId)
    const tieneSuscripcion = await suscripcionesService.tieneSuscripcionActiva(userId)
    const suscripcion = await suscripcionesService.obtenerSuscripcionActiva(userId)

    return {
      totalPublicaciones,
      limite,
      disponibles: Math.max(0, limite - totalPublicaciones),
      tieneSuscripcion,
      suscripcion: suscripcion
        ? {
            id: suscripcion.id,
            planNombre: suscripcion.plan_suscripcion?.nombre_plan,
            fechaInicio: suscripcion.fecha_inicio,
            fechaFin: suscripcion.fecha_fin
          }
        : null
    }
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
