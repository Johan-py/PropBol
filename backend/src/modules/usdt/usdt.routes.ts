import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { crearPagoUsdt, verificarPagoUsdt, obtenerTipoCambio } from './usdt.controller.js'

const router = Router()

router.get('/tipo-cambio', obtenerTipoCambio)
router.post('/', requireAuth, crearPagoUsdt)
router.post('/:id/verificar', requireAuth, verificarPagoUsdt)

export default router
