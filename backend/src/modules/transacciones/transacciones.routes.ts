import { Router } from 'express'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion,
  confirmarPago,
  aplicarCupon,
} from './transacciones.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.post('/', requireAuth, generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.patch('/:id/confirmar', requireAuth, confirmarPago)
router.patch('/:id/cancelar', cancelarTransaccion)
router.post('/:id/cupon', aplicarCupon)
router.get('/:id/estado', consultarEstadoPago)

export default router
