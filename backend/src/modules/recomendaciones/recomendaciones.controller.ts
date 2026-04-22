import { Request, Response } from 'express'
import { RecomendacionesService } from './recomendaciones.service.js'

const recomendacionesService = new RecomendacionesService()

export const getRecomendacionesGlobales = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' })
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20

    const recomendaciones = await recomendacionesService.getRecomendacionesGlobales({
      usuarioId,
      limit
    })

    res.status(200).json({ success: true, data: recomendaciones })
  } catch (error) {
    console.error('Error en getRecomendacionesGlobales:', error)
    res.status(500).json({ success: false, error: 'Error al obtener recomendaciones' })
  }
}