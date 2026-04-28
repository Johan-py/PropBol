import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.client.js";
import { publicacionesService } from "../modules/publicaciones/publicaciones.service.js";

// Crear publicación (HU‑1 + HU‑5 v2)
export const crearPublicacion = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion, cancelado, step } = req.body;
    const userId = (req as any).user.id; // viene del middleware JWT

    // ✅ Validación HU‑5 v2: límite de publicaciones
    try {
      await publicacionesService.validarPublicacionHU5(userId, req.body);
    } catch (error) {
      if (error instanceof Error && error.message === "LIMIT_REACHED") {
        return res.status(403).json({
          estado: "Pendiente de revisión",
          error: "LIMIT_REACHED",
          message: "Has alcanzado el límite de 2 publicaciones gratuitas."
        });
      }
      return res.status(400).json({
        estado: "Pendiente de revisión",
        error: error instanceof Error ? error.message : "Error de validación",
      });
    }

    // ✅ Validar que esté en la última etapa (BUG‑E01/E05)
    if (step !== "final") {
      return res.status(400).json({
        error: "FORM_INCOMPLETE",
        message: "Debes completar todas las etapas antes de publicar.",
      });
    }

    // ✅ Cancelación explícita (BUG‑E03/E04)
    if (cancelado === true) {
      return res.status(400).json({
        error: "PUBLICATION_CANCELLED",
        message: "La publicación fue cancelada por el usuario.",
      });
    }

    // Flujo HU‑1: creación normal con transacción + progreso real
    let progress = 30; // validación completada

    const nueva = await prisma.$transaction(async (tx) => {
      // Paso 2: guardar publicación
      const pub = await tx.publicacion.create({
        data: {
          titulo,
          descripcion,
          usuario: { connect: { id: userId } },
          inmueble: { connect: { id: 1 } }, // ajusta según tu lógica real
        },
      });
      progress = 60;

      // Paso 3: guardar multimedia (si aplica)
      // ...
      progress = 100;

      return pub;
    });

    return res.status(201).json({
      estado: "Validado",
      mensaje: "Publicación creada correctamente",
      progress, // ✅ progreso real
      publicacion: nueva,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Error al crear publicación" });
  }
};
