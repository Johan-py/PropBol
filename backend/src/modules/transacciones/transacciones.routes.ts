import { Router } from 'express'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion,
  confirmarPago,
  rechazarPago,
  aplicarCupon,
  actualizarTransaccion,
  listarTransaccionesAdmin,
} from './transacciones.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.get('/admin', requireAuth, listarTransaccionesAdmin)
router.post('/', requireAuth, generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.patch('/:id/confirmar', requireAuth, confirmarPago)
router.patch('/:id/rechazar', requireAuth, rechazarPago)
router.patch('/:id/cancelar', cancelarTransaccion)
router.patch('/:id/actualizar', actualizarTransaccion)
router.post('/:id/cupon', aplicarCupon)
router.get('/:id/estado', consultarEstadoPago)

export default router
