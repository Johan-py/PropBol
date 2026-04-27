import { Router } from 'express'
import { getConsumo } from '../../modules/LimiteSuscripcion/consumo.controllers.js'
import { getPlanLimit } from '../../modules/LimiteSuscripcion/planController.js'
// import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

// 🔥 SIN TOKEN (para probar)
router.get('/consumo/:userId', getConsumo)

router.get('/limite', getPlanLimit)
export default router
