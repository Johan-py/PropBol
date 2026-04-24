import { Router } from 'express'
import {
  getRecomendacionesGlobales,
  getInmueblesRecomendados,
  ordenarPorAfinidad
} from './recomendaciones.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

router.get('/globales', validarJWT, getRecomendacionesGlobales)
router.get('/inmuebles', validarJWT, getInmueblesRecomendados)
router.post('/ordenar', validarJWT, ordenarPorAfinidad)

export default router
