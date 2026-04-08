import { Publicacion } from "@prisma/client"
import { prisma } from "../../db.js" 

export const publicacionesRepository = {
  async findAll(): Promise<Publicacion[]> {
    return prisma.publicacion.findMany()
  },

  async findGratis(): Promise<Publicacion[]> {
    return prisma.publicacion.findMany({
      where: { inmueble: { precio: 0 } },
    })
  },

  async countByUser(userId: number): Promise<number> {
    return prisma.publicacion.count({ where: { usuarioId: userId } })
  },

  async create(
    userId: number,
    data: any
  ): Promise<Publicacion> {
    return prisma.publicacion.create({
      data: {
        // 1. Datos para la Publicación
        titulo: data.titulo,
        descripcion: data.descripcion,
        // Usamos connect para enlazar la publicación al usuario sin errores
        usuario: {
          connect: { id: userId }
        },
        
        // 2. Datos para el Inmueble
        inmueble: {
          create: {
            titulo: data.titulo,
            tipoAccion: data.tipoAccion,
            categoria: data.categoria || "CASA", // Por si viene vacío, evita errores
            precio: data.precio,
            superficieM2: data.superficieM2,
            nroCuartos: data.nroCuartos,
            nroBanos: data.nroBanos,
            descripcion: data.descripcion,
            // ESTA ES LA SOLUCIÓN: Usamos connect para enlazar el inmueble al propietario
            propietario: {
              connect: { id: userId }
            }
          }
        }
      },
    })
  },
}