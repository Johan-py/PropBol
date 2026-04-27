import { Router } from 'express'
import {
  getRecomendacionesGlobales,
  getInmueblesRecomendados,
  ordenarPorAfinidad,
  invalidarCacheUsuario
} from './recomendaciones.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

router.get('/globales', validarJWT, getRecomendacionesGlobales)
router.get('/inmuebles', validarJWT, getInmueblesRecomendados)
router.post('/ordenar', validarJWT, ordenarPorAfinidad)
router.post('/invalidar-cache', validarJWT, invalidarCacheUsuario)

export default router
