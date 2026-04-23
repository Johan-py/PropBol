import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listarMisPublicacionesController,
  editarPublicacionController,
  eliminarPublicacionController,
} from "./publicacion.controller.js";

const router = Router();

router.get("/mias", requireAuth, listarMisPublicacionesController);
router.put("/:id", requireAuth, editarPublicacionController);
router.delete("/:id", requireAuth, eliminarPublicacionController);

export default router;
