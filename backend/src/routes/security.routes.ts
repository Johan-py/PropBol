import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  deactivateAccountController,
  validateCurrentPasswordController,
} from "../modules/security/security.controller.js";

const router = Router();

router.post(
  "/validate-password",
  requireAuth,
  validateCurrentPasswordController,
);

router.delete("/deactivate-account", requireAuth, deactivateAccountController);

export default router;
