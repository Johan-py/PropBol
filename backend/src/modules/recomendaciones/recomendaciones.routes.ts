import { Router } from 'express'
import {
  getRecomendacionesGlobales,
  getInmueblesRecomendados
} from './recomendaciones.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

router.get('/globales', validarJWT, getRecomendacionesGlobales)
router.get('/inmuebles', validarJWT, getInmueblesRecomendados)

export default router
