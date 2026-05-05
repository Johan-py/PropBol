import { Request, Response } from 'express'
import { RecomendacionesService } from './recomendaciones.service.js'
import { cache } from '../../lib/cache.service.js'

const recomendacionesService = new RecomendacionesService()

export const getRecomendacionesGlobales = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' })
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const zonaForzada = req.query.zona as string | undefined

    const recomendaciones = await recomendacionesService.getRecomendacionesGlobales({
      usuarioId,
      limit,
      zonaForzada
    })

    res.status(200).json({ success: true, data: recomendaciones })
  } catch (error) {
    console.error('Error en getRecomendacionesGlobales:', error)
    res.status(500).json({ success: false, error: 'Error al obtener recomendaciones' })
  }
}
export const getInmueblesRecomendados = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    console.log('usuarioId recibido en recomendaciones:', usuarioId) //pruebas 
    
    const zona = req.query.zona as string | undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50

    let resultados: any[] = []

    if (usuarioId) {
      // CA 5, 6, 7: Si hay sesión, buscamos recomendaciones personalizadas por afinidad
      resultados = await recomendacionesService.getRecomendacionesGlobales({
        usuarioId,
        limit,
        zonaForzada: zona
      })
    } else {
      const zonaBuscar = zona || 'Cochabamba' 
      resultados = await recomendacionesService.getRecomendacionesPorPopularidad(zonaBuscar, limit)
    }

    res.status(200).json({ success: true, data: resultados })
  } catch (error) {
    console.error('Error en getInmueblesRecomendados:', error)
    res.status(500).json({ success: false, error: 'Error al obtener resultados' })
  }
}

export const ordenarPorAfinidad = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' })
    }

    const { inmuebleIds } = req.body
    if (!Array.isArray(inmuebleIds) || inmuebleIds.length === 0) {
      return res.status(400).json({ success: false, error: 'inmuebleIds es requerido' })
    }

    const resultado = await recomendacionesService.ordenarPorAfinidad(inmuebleIds, usuarioId)
    res.status(200).json({ success: true, data: resultado })
  } catch (error) {
    console.error('Error en ordenarPorAfinidad:', error)
    res.status(500).json({ success: false, error: 'Error al ordenar por afinidad' })
  }
}
export const invalidarCacheUsuario = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' })
    }
    cache.invalidateUsuario(usuarioId)
    res.status(200).json({ success: true, message: 'Caché invalidado' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al invalidar caché' })
  }
}


