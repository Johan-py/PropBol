import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.client.js";

// Crear publicación
export const crearPublicacion = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion } = req.body;
    const userId = (req as unknown as { user?: { id: number } }).user?.id;

    // validar límite de publicaciones gratuitas
    const publicaciones = await prisma.publicacion.count({
      where: { usuarioId: userId },
    });

    if (publicaciones >= 2) {
      return res
        .status(403)
        .json({ error: "Límite de publicaciones gratuitas alcanzado" });
    }

    const nueva = await prisma.publicacion.create({
      data: {
        titulo,
        descripcion,
        usuario: { connect: { id: userId } },
        inmueble: { connect: { id: 1 } }, // ajusta según tu lógica real
      },
    });

    res.status(201).json(nueva);
  } catch {
    res.status(500).json({ error: "Error al crear publicación" });
  }
};

// Listar publicaciones
export const listarPublicaciones = async (req: Request, res: Response) => {
  try {
    const publicaciones = await prisma.publicacion.findMany();
    res.json(publicaciones);
  } catch {
    res.status(500).json({ error: "Error al listar publicaciones" });
  }
};

// Validar publicaciones gratuitas
export const validarPublicacionesFree = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    const publicaciones = await prisma.publicacion.count({
      where: { usuarioId: userId },
    });

    const limiteGratis = 2;
    const restantes = Math.max(limiteGratis - publicaciones, 0);

    res.json({ restantes });
  } catch {
    res.status(500).json({ error: "Error al validar publicaciones gratuitas" });
  }
};
