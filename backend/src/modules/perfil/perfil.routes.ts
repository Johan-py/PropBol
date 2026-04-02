import { Router } from 'express'
import {
  getMyProfileController,
  updateNameController,
  updateAvatarController
} from './perfil.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { uploadPerfilAvatar } from '../../middleware/upload.middleware.js'

const router = Router()

router.get('/me', requireAuth, getMyProfileController)
router.put('/name', requireAuth, updateNameController)
router.put('/avatar', requireAuth, uploadPerfilAvatar.single('avatar'), updateAvatarController)

export default router