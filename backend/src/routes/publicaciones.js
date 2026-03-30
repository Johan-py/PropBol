import { Router } from "express";
import { validarSesion, publicacionesGratis, crearPublicacion, listarPublicaciones } from "../controllers/publicacionesController.js";
import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = Router();

// Validar sesión
router.get("/auth/validate", validarSesion);

// Consultar publicaciones gratuitas
router.get("/users/:id/publicaciones/free", authMiddleware, publicacionesGratis);

// Crear publicación
router.post("/publicaciones", authMiddleware, crearPublicacion);

// listarPublicaciones
router.get("/publicaciones", listarPublicaciones);

export default router;
