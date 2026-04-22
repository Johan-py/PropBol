import { Publicacion } from "@prisma/client";
// ¡Ruta corregida! Apuntando al archivo db.ts de tu equipo
import { prisma } from "../../lib/prisma.client.js";

export const publicacionesRepository = {
  async findAll(): Promise<Publicacion[]> {
    return prisma.publicacion.findMany();
  },

  async findGratis(): Promise<Publicacion[]> {
    // Ajusta el campo según tu schema.prisma (ejemplo: costo en vez de precio)
    return prisma.publicacion.findMany({
      where: { inmueble: { precio: 0 } },
    });
  },

  async countByUser(userId: number): Promise<number> {
    return prisma.publicacion.count({ where: { usuarioId: userId } });
  },

  async findByUserId(userId: number) {
    return prisma.publicacion.findMany({
      where: { usuarioId: userId },
      include: {
        inmueble: {
          include: {
            ubicacion: true,
          },
        },
        multimedia: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        fechaPublicacion: "desc",
      },
    });
  },

  async create(
    userId: number,
    data: Omit<Publicacion, "id" | "usuarioId">,
  ): Promise<Publicacion> {
    return prisma.publicacion.create({
      data: {
        ...data,
        usuarioId: userId,
      },
    });
  },
};
