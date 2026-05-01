import { Router } from 'express';
import { getHistorialVistas } from './historial.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// Ruta: /api/perfil/historial/vistas
router.get('/vistas', requireAuth, getHistorialVistas);

export default router;