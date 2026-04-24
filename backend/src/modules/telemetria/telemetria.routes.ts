import { Router } from "express";
import {
  trackSearch,
  trackClick,
  getRecomendados,
} from "./telemetria.controller.js";
import { validarJWT } from "../../middleware/validarJWT.js";

const router = Router();

router.post("/search", trackSearch);
router.post("/click", validarJWT, trackClick);
router.get("/recomendados", validarJWT, getRecomendados);

export default router;
