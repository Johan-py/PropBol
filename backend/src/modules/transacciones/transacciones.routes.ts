import { Router } from 'express'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion,
  confirmarPago,
  aplicarCupon,
} from './transacciones.controller.js'

const router = Router()

router.post('/', generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.patch('/:id/confirmar', confirmarPago)
router.patch('/:id/cancelar', cancelarTransaccion)
router.post('/:id/cupon', aplicarCupon)
router.get('/:id/estado', consultarEstadoPago)

export default router
