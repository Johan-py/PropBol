import { Router } from 'express';
import { crearPublicacion, listarPublicaciones, validarPublicacionesFree } from '../controllers/publicacionesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/publicaciones', authMiddleware, crearPublicacion);
router.get('/publicaciones', listarPublicaciones);
router.get('/users/:id/publicaciones/free', authMiddleware, validarPublicacionesFree);

export default router;
