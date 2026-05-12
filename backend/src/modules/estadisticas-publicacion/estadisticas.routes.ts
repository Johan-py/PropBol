import { Router } from 'express'
import { EstadisticasPublicacionController } from './estadisticas.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { optionalAuth } from '../../middleware/optional-auth.middleware.js'

const router = Router()

router.post(
  '/publicaciones/:publicacionId/vistas',
  optionalAuth,
  EstadisticasPublicacionController.registrarVista
)

router.post(
  '/publicaciones/:publicacionId/compartidos',
  requireAuth,
  EstadisticasPublicacionController.registrarCompartido
)

router.get(
  '/publicaciones/:publicacionId/estadisticas',
  requireAuth,
  EstadisticasPublicacionController.obtenerEstadisticas
)

router.get(
  '/usuarios/me/propiedades-vistas',
  requireAuth,
  EstadisticasPublicacionController.obtenerMisPropiedadesVistas
)

export default router
