import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import poisService from './pois.service.js'

export const crearPoi = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errores: errors.array().map((e: any) => ({ campo: e.path, mensaje: e.msg }))
    })
  }

  const inmuebleId = Number(req.params.inmuebleId)
  const usuarioId = req.user?.id

  if (!usuarioId) return res.status(401).json({ message: 'NOT_AUTHENTICATED' })
  if (isNaN(inmuebleId)) return res.status(400).json({ message: 'ID de inmueble inválido' })

  const { nombre, latitud, longitud } = req.body

  try {
    const poi = await poisService.crearPoi(inmuebleId, nombre, Number(latitud), Number(longitud))
    return res.status(201).json({ mensaje: 'Punto de interés creado', poi })
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el punto de interés' })
  }
}

export const eliminarPoi = async (req: Request, res: Response) => {
  const poiId = Number(req.params.poiId)
  const usuarioId = req.user?.id

  if (!usuarioId) return res.status(401).json({ message: 'NOT_AUTHENTICATED' })
  if (isNaN(poiId)) return res.status(400).json({ message: 'ID de POI inválido' })

  try {
    await poisService.eliminarPoi(poiId, usuarioId)
    return res.status(200).json({ mensaje: 'Punto de interés eliminado' })
  } catch (error: any) {
    if (error.message === 'POI_NOT_FOUND') return res.status(404).json({ mensaje: 'Punto de interés no encontrado' })
    if (error.message === 'FORBIDDEN') return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este punto' })
    return res.status(500).json({ mensaje: 'Error al eliminar el punto de interés' })
  }
}

export const listarPois = async (req: Request, res: Response) => {
  const inmuebleId = Number(req.params.inmuebleId)
  if (isNaN(inmuebleId)) return res.status(400).json({ message: 'ID de inmueble inválido' })

  try {
    const pois = await poisService.listarPoisPorInmueble(inmuebleId)
    return res.status(200).json(pois)
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener los puntos de interés' })
  }
}
