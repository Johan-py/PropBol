import { Router } from 'express'
import { verificarToken } from '../../middleware/auth.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  getPlanes,
  getPlanById,
  getAdminPlanes,
  createPlan,
  updatePlan,
  softDeletePlan,
  restorePlan,
} from './plans.controller.js'
import { calcularPrecio } from './priceCalculator.controller.js'
import {
  crearOrdenCobro,
  listarOrdenes,
  cancelarOrden,
  cambiarPlan
} from './ordenCobro.controller.js'

const router = Router()

// HU-01
router.get('/membership-plans', verificarToken, getPlanes)

// HU-10 — Admin CRUD de planes (antes de /:id para evitar conflicto)
router.get('/admin/lista', requireAuth, getAdminPlanes)
router.post('/admin', requireAuth, createPlan)
router.put('/admin/:id', requireAuth, updatePlan)
router.delete('/admin/:id', requireAuth, softDeletePlan)
router.patch('/admin/:id/restaurar', requireAuth, restorePlan)

router.get('/:id', verificarToken, getPlanById)

// HU-07
router.post('/calcular-precio', verificarToken, calcularPrecio)
router.post('/crear-orden', verificarToken, crearOrdenCobro)
router.get('/mis-ordenes', verificarToken, listarOrdenes)
router.delete('/cancelar-orden/:id', verificarToken, cancelarOrden)
router.put('/cambiar-plan', verificarToken, cambiarPlan)

export default router
