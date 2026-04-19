import type { Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";
import propertyService from "../registro-publicacion/publicacion.service.js";

export const createProperty = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errores: errors.array().map((error: ValidationError) => ({
        campo: error.path,
        mensaje: error.msg,
      })),
    });
  }

  try {
    // const userId = (req as any).user?.id;

    // if (!userId) {
    // return res.status(401).json({
    // mensaje: 'Usuario no autenticado'
    // });
    // }
    const userId = 4;
    const property = await propertyService.createProperty(req.body, userId);

    return res.status(201).json({
      mensaje: "Publicación registrada correctamente",
      property,
    });
  } catch (error: unknown) {
    console.error("Error al registrar la propiedad:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    // Validar si es un error de permiso de publicación
    if (
      errorMessage.includes("límite de publicaciones gratuitas") ||
      errorMessage.includes("suscripción activa") ||
      errorMessage.includes("límite de publicaciones de tu plan")
    ) {
      return res.status(403).json({
        mensaje: errorMessage,
        tipo: "LIMITE_PUBLICACIONES",
      });
    }

    return res.status(500).json({
      mensaje: "Error al registrar la propiedad",
      detalle: errorMessage,
    });
  }
};

export const cancelProperty = async (_req: Request, res: Response) => {
  return res.status(200).json({
    mensaje: "Operación cancelada, regresando a la pantalla anterior",
  });
};
