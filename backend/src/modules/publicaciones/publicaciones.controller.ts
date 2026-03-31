import { Request, Response } from 'express'
import {
  getPublicacionesByUsuario,
  updatePublicacion,
  deletePublicacion
} from './publicaciones.repository.js'

export const getPublicaciones = async (req: Request, res: Response) => {
  try {
    const usuarioId = Number(req.params.usuarioId)
    const data = await getPublicacionesByUsuario(usuarioId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener publicaciones' })
  }
}

export const editPublicacion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const data = await updatePublicacion(id, req.body)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar publicación' })
  }
}

export const removePublicacion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    await deletePublicacion(id)
    res.json({ message: 'Publicación eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar publicación' })
  }
}