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

// HU1 - Listar todas las publicaciones
router.get("/publicaciones", listarPublicaciones);

// HU1 - Listar publicaciones gratuitas
router.get("/publicaciones/gratis", listarPublicacionesGratis);

// HU5 v2 - Crear publicación con validación automática y corrección guiada
router.post(
  "/publicaciones",
  requireAuth,
  propertyValidationRules,
  manejarErroresPublicacion,
  crearPublicacion
);

// HU5 - Flujo de publicación (validación de límite)
router.get("/publicaciones/flujo", requireAuth, flujoPublicacion);

export default router;
