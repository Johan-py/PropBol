import { Router } from "express";
import { getConsumo } from "../controllers/consumo.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/consumo/:userId", authMiddleware, getConsumo);

export default router;