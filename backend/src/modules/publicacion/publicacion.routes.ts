<<<<<<< HEAD
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listarMisPublicacionesController,
=======
import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  listarMisPublicacionesController,
  obtenerResumenFinalController,
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  editarPublicacionController,
  eliminarPublicacionController,
  obtenerDetallePublicacionController
} from './publicacion.controller.js'

const router = Router()

<<<<<<< HEAD
router.get("/mias", requireAuth, listarMisPublicacionesController);
router.put("/:id", requireAuth, editarPublicacionController);
router.delete("/:id", requireAuth, eliminarPublicacionController);

export default router;
=======
router.get('/mias', requireAuth, listarMisPublicacionesController)
router.get('/:id/resumen-final', requireAuth, obtenerResumenFinalController)
router.get('/:id/detalle', obtenerDetallePublicacionController)
router.put('/:id', requireAuth, editarPublicacionController)
router.delete('/:id', requireAuth, eliminarPublicacionController)

export default router
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
