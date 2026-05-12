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
  iniciarPublicidadController,
  confirmarPublicidadController,
  cancelarPublicidadController,
  obtenerEstadoPublicidadController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', requireAuth, listarMisPublicacionesController)
router.get('/:id/resumen-final', requireAuth, obtenerResumenFinalController)
router.get('/inmueble/:inmuebleId/detalle', obtenerDetallePublicacionPorInmuebleController)
router.get('/:id/detalle', obtenerDetallePublicacionController)
router.patch('/:id/confirmar', requireAuth, confirmarPublicacionController)
router.put('/:id', requireAuth, editarPublicacionController)
router.delete('/:id', requireAuth, eliminarPublicacionController)
router.post('/:id/publicitar', requireAuth, iniciarPublicidadController)
router.post('/:id/publicitar/confirmar', requireAuth, confirmarPublicidadController)
router.delete('/:id/publicitar/cancelar', requireAuth, cancelarPublicidadController)
router.get('/:id/publicitar/estado', obtenerEstadoPublicidadController)
export default router
