import type { Request, Response } from 'express'
import { suscripcionesService } from './suscripciones.service.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

export const obtenerMiSuscripcion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })

    const suscripcion = await suscripcionesService.obtenerSuscripcionActiva(userId)

    if (!suscripcion) {
      return res.json({ activa: false, idSuscripcion: null, planNombre: null })
    }

    return res.json({
      activa: true,
      idSuscripcion: suscripcion.id_suscripcion,
      planNombre: suscripcion.plan_suscripcion?.nombre_plan ?? null,
      precioPlan: suscripcion.plan_suscripcion?.precio_plan
        ? Number(suscripcion.plan_suscripcion.precio_plan)
        : null,
      nroPublicaciones: suscripcion.plan_suscripcion?.nro_publicaciones_plan ?? null,
      duracionDias: suscripcion.plan_suscripcion?.duracion_plan_dias ?? null,
      fechaInicio: suscripcion.fecha_inicio,
      fechaFin: suscripcion.fecha_fin,
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno',
    })
  }
}
