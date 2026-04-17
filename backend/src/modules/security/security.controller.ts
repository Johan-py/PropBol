import type { Request, Response } from "express";
import {
  SecurityError,
  validateCurrentPasswordService,
} from "./security.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
    correo?: string;
  };
};

export async function validateCurrentPasswordController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);
    const { password } = req.body ?? {};

    const result = await validateCurrentPasswordService(userId, password);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({
        valid: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      valid: false,
      message: "Error interno del servidor.",
    });
  }
}
