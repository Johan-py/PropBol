import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listarPublicaciones,
  listarPublicacionesGratis,
  crearPublicacion,
  flujoPublicacion,
} from "./publicaciones.controller.js";
import {
  propertyValidationRules,
  manejarErroresPublicacion,
} from "./publicaciones.validator.js"; 

const router = Router();

router.get("/publicaciones", listarPublicaciones);
router.get("/publicaciones/gratis", listarPublicacionesGratis);
router.post("/publicaciones", requireAuth, crearPublicacion);
router.get("/publicaciones/flujo", requireAuth, flujoPublicacion);

// Nueva ruta HU‑5 v2
router.post(
  "/publicaciones/hu5",
  requireAuth,
  propertyValidationRules,      
  manejarErroresPublicacion,    
  crearPublicacion,          
);


export default router;
