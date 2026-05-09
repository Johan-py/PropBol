import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { uploadMultimedia } from '../../middleware/uploadMultimedia.middleware.js'
import {
  listarMisPublicacionesController,
  obtenerResumenFinalController,
  editarPublicacionController,
  editarMultimediaPublicacionController,
  eliminarPublicacionController,
  obtenerDetallePublicacionController,
  obtenerDetallePublicacionPorInmuebleController,
  confirmarPublicacionController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', requireAuth, listarMisPublicacionesController)
router.get('/:id/resumen-final', requireAuth, obtenerResumenFinalController)
router.get('/inmueble/:inmuebleId/detalle', obtenerDetallePublicacionPorInmuebleController)
router.get('/:id/detalle', obtenerDetallePublicacionController)
router.patch('/:id/confirmar', requireAuth, confirmarPublicacionController)

router.put(
  '/:id/multimedia',
  requireAuth,
  uploadMultimedia.array('imagenesNuevas', 10),
  editarMultimediaPublicacionController
)

router.put('/:id', requireAuth, editarPublicacionController)
router.delete('/:id', requireAuth, eliminarPublicacionController)

export default router