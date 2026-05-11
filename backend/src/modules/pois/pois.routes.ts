import { Router } from 'express'
import { crearPoi, eliminarPoi, listarPois } from './pois.controller.js'
import { crearPoiRules } from './pois.validator.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

// Crear POI para un inmueble (solo propietario autenticado)
router.post('/inmueble/:inmuebleId', requireAuth, crearPoiRules, crearPoi)

// Eliminar un POI específico (solo propietario)
router.delete('/:poiId', requireAuth, eliminarPoi)

// Listar POIs de un inmueble (público, para el detalle de publicación)
router.get('/inmueble/:inmuebleId', listarPois)

export default router
