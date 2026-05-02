import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  listarMisPublicacionesController,
  obtenerResumenFinalController,
  editarPublicacionController,
  eliminarPublicacionController,
  obtenerDetallePublicacionController,
  obtenerDetallePublicacionPorInmuebleController,
  confirmarPublicacionController,
  registrarVistaController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', requireAuth, listarMisPublicacionesController)
router.get('/:id/resumen-final', requireAuth, obtenerResumenFinalController)
router.get('/inmueble/:inmuebleId/detalle', obtenerDetallePublicacionPorInmuebleController)
router.get('/:id/detalle', obtenerDetallePublicacionController)
router.patch('/:id/confirmar', requireAuth, confirmarPublicacionController)
router.put('/:id', requireAuth, editarPublicacionController)
router.delete('/:id', requireAuth, eliminarPublicacionController)

router.post('/:id/view', registrarVistaController)

export default router
