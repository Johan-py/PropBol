import type { Request, Response } from "express";
import {
  SecurityError,
  deactivateAccountService,
  validateCurrentPasswordService,
  sendDeactivateAccountCodeService,
  verifyDeactivateAccountCodeService,
  activate2FAService,
  get2FAStatusService,
} from "./security.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
    correo?: string;
  };
};

export async function sendDeactivateAccountCodeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);

    const result = await sendDeactivateAccountCodeService(userId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
}

export async function verifyDeactivateAccountCodeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);
    const { codigo, verificationToken } = req.body ?? {};

    const result = await verifyDeactivateAccountCodeService({
      userId,
      codigo,
      verificationToken,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
}

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

export async function deactivateAccountController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);
    const { password } = req.body ?? {};

    const result = await deactivateAccountService(userId, password);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
}

export async function activate2FAController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);
    const { password } = req.body ?? {};

    const result = await activate2FAService(userId, password);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

export async function get2FAStatusController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = Number(req.user?.id);
    const result = await get2FAStatusService(userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SecurityError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}
