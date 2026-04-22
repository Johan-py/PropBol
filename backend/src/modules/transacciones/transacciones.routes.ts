import { Router } from 'express'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion
} from './transacciones.controller.js'

const router = Router()

router.post('/', generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.get('/:id/estado', consultarEstadoPago)
router.patch('/:id/cancelar', cancelarTransaccion)

export default router
