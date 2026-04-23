import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.client.js";
import { publicacionesService } from "../modules/publicaciones/publicaciones.service.js";

// Crear publicación (HU‑1 + HU‑5 v2)
export const crearPublicacion = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion } = req.body
    const userId = (req as any).user.id // viene del middleware JWT

<<<<<<< HEAD
    // 1. Contar cuántas propiedades tiene este usuario
    const publicaciones = await prisma.publicacion.count({
      where: { usuarioId: userId }
    })

    // 2. CORRECCIÓN MATEMÁTICA: Si ya tiene 2, cobramos (la 0 y la 1 son gratis)
    if (publicaciones >= 2) {
      // 3. USAMOS 402: "Payment Required" para no confundirlo con errores de Token
      return res.status(402).json({ error: 'Límite de publicaciones gratuitas alcanzado' })
=======
    // Validación HU‑5 v2: límite de publicaciones
    try {
      await publicacionesService.validarPublicacionHU5(userId, req.body);
    } catch (error) {
      if (error instanceof Error && error.message === "LIMIT_REACHED") {
        return res.status(403).json({
          estado: "Pendiente de revisión",
          error: "Límite de publicaciones gratuitas alcanzado",
        });
      }
      return res.status(400).json({
        estado: "Pendiente de revisión",
        error: error instanceof Error ? error.message : "Error de validación",
      });
>>>>>>> ae8074f43afab57f05b9fb8258dffe280cac5aca
    }

    // Flujo HU‑1: creación normal
    const nueva = await prisma.publicacion.create({
      data: {
        titulo,
        descripcion,
        usuario: { connect: { id: userId } },
        inmueble: { connect: { id: 1 } } // ajusta según tu lógica real
      }
    })

<<<<<<< HEAD
    res.status(201).json(nueva)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear publicación' })
  }
}
// Listar publicaciones
export const listarPublicaciones = async (req: Request, res: Response) => {
=======
    return res.status(201).json({
      estado: "Validado",
      mensaje: "Publicación creada correctamente",
      publicacion: nueva,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Error al crear publicación" });
  }
};

// HU‑1: Listar publicaciones
export const listarPublicaciones = async (_req: Request, res: Response) => {
>>>>>>> ae8074f43afab57f05b9fb8258dffe280cac5aca
  try {
    const publicaciones = await prisma.publicacion.findMany()
    res.json(publicaciones)
  } catch (error) {
    res.status(500).json({ error: 'Error al listar publicaciones' })
  }
}

// HU‑1: Validar publicaciones gratuitas (consulta simple)
export const validarPublicacionesFree = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10)
    const publicaciones = await prisma.publicacion.count({
      where: { usuarioId: userId }
    })

<<<<<<< HEAD
    const limiteGratis = 3
    const restantes = Math.max(limiteGratis - publicaciones, 0)
=======
    const limiteGratis = 2;
    const restantes = Math.max(limiteGratis - publicaciones, 0);
>>>>>>> ae8074f43afab57f05b9fb8258dffe280cac5aca

    res.json({ restantes })
  } catch (error) {
    res.status(500).json({ error: 'Error al validar publicaciones gratuitas' })
  }
}