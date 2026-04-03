import { Router } from 'express'
import {
  getMyProfileController,
  updateNameController,
  updateAvatarController
} from './perfil.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { uploadPerfilAvatar } from '../../middleware/upload.middleware.js'

const router = Router()

// GET /api/perfil/me
// Retorna la información del perfil del usuario autenticado.
// Incluye: id, nombreCompleto, email y avatar.
router.get('/me', requireAuth, getMyProfileController)

// PUT /api/perfil/name
// Actualiza el nombre completo del usuario autenticado.
// Recibe en el body: { nombreCompleto }
router.put('/name', requireAuth, updateNameController)

// PUT /api/perfil/avatar
// Actualiza la foto de perfil del usuario autenticado.
// Recibe un archivo en el campo "avatar" (imagen JPG o PNG).
router.put(
  '/avatar',
  requireAuth,
  uploadPerfilAvatar.single('avatar'),
  updateAvatarController
)

export default router