import { Router } from 'express';
import { getHistorialVistas} from "../controllers/propiedad.controller.js";
import { compare } from "../modules/properties/properties.controller.js";
import { requireAuth} from "../middleware/auth.middleware.js";

const router = Router();

// Aplicamos requireAuth: solo usuarios logueados verán su historial
router.get('/vistas-recientes', requireAuth, getHistorialVistas);
// Ruta para comparar propiedades públicamente accesible, sin requireAuth
router.post('/comparar', compare);

export default router;