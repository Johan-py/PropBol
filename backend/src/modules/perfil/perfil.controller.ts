import { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'
import {
  getMyProfileService,
  updateNameService,
  updateAvatarService
} from './perfil.service.js'

const getUserIdFromRequest = (req: AuthenticatedRequest) => {
  if (!req.user?.id) {
    throw new Error('Usuario no autenticado')
  }

  return req.user.id
}

export const getMyProfileController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = getUserIdFromRequest(req)
    const data = await getMyProfileService(userId)
    res.json(data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al obtener perfil'
    res.status(400).json({ message })
  }
}

export const updateNameController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = getUserIdFromRequest(req)
    const { nombreCompleto } = req.body
    const data = await updateNameService(userId, nombreCompleto)
    res.json(data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al actualizar nombre'
    res.status(400).json({ message })
  }
}

export const updateAvatarController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = getUserIdFromRequest(req)

    if (!req.file) {
      return res.status(400).json({ message: 'Debes enviar una imagen' })
    }

    const avatarPath = `/uploads/perfiles/${req.file.filename}`

    const data = await updateAvatarService(userId, avatarPath)
    res.json(data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al actualizar avatar'
    res.status(400).json({ message })
  }
}