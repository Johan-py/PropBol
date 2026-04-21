import { Router } from 'express'
import { getRecomendacionesGlobales } from './recomendaciones.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

router.get('/globales', validarJWT, getRecomendacionesGlobales)

export default router
