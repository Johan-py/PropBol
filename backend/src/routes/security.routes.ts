import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateCurrentPasswordController } from "../modules/security/security.controller.js";

const router = Router();

router.post(
  "/validate-password",
  requireAuth,
  validateCurrentPasswordController,
);

export default router;
