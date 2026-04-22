import { Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";
import { publicacionesService } from "./publicaciones.service.js";

export type AuthenticatedRequest = Request & {
  user?: { id: number; email?: string };
};

export const listarPublicaciones = async (_req: Request, res: Response) => {
  const publicaciones = await publicacionesService.listarTodas();
  return res.json(publicaciones);
};

export const listarPublicacionesGratis = async (
  _req: Request,
  res: Response,
) => {
  const publicaciones = await publicacionesService.listarGratis();
  return res.json(publicaciones);
};

export const crearPublicacion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ estado: "NOT_AUTHENTICATED", mensaje: "No autenticado. Redirigir a login." });
    }

    // Validaciones automáticas HU‑5 v2
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        estado: "Pendiente de revisión",
        totalErrores: errores.array().length,
        errores: errores.array().map((err: ValidationError & { param?: string; msg?: string }) => ({
          campo: err.param ?? "campo_desconocido",
          mensaje: err.msg ?? "Error sin mensaje",
        })),
      });
    }

    // Si pasa validación, crear publicación
    const nueva = await publicacionesService.crear(req.user.id, req.body);

    return res.status(201).json({
      estado: "Validado",
      mensaje: "Publicación guardada correctamente",
      publicacion: nueva,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "LIMIT_REACHED") {
        return res.status(403).json({
          estado: "Error",
          mensaje: "Has alcanzado el límite de publicaciones gratuitas.",
        });
      }

      return res.status(400).json({
        estado: "Error",
        mensaje: error.message,
      });
    }

    return res.status(500).json({
      estado: "Error",
      mensaje: "Error interno del servidor.",
    });
  }
};

export const flujoPublicacion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "NOT_AUTHENTICATED",
        mensaje: "No autenticado. Redirigir a login.",
      });
    }

    await publicacionesService.validarFlujo(req.user.id);

    return res.status(200).json({
      message: "FLOW_ALLOWED",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "LIMIT_REACHED") {
        return res.status(403).json({
          message: "LIMIT_REACHED",
          mensaje: "Has alcanzado el límite de publicaciones gratuitas.",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};
