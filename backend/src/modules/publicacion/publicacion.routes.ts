import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  listarMisPublicacionesController,
  obtenerResumenFinalController,
  editarPublicacionController,
  eliminarPublicacionController,
  obtenerDetallePublicacionController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', requireAuth, listarMisPublicacionesController)
router.get('/:id/resumen-final', requireAuth, obtenerResumenFinalController)
router.put('/:id', requireAuth, editarPublicacionController)
router.delete('/:id', requireAuth, eliminarPublicacionController)
router.get('/:id/detalle', obtenerDetallePublicacionController)

export default router
