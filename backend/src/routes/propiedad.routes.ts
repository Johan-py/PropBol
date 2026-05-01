import { Router } from 'express';
import { getHistorialVistas} from "../controllers/propiedad.controller.js";
import { requireAuth} from "../middleware/auth.middleware.js";

const router = Router();

// Aplicamos requireAuth: solo usuarios logueados verán su historial
router.get('/vistas-recientes', requireAuth, getHistorialVistas);

export default router;