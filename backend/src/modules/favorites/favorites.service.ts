import { prisma } from '../../lib/prisma.client.js'

export class FavoritesService {

  static async getAll(usuarioId: number, page: number, perPage: number) {
    const skip = (page - 1) * perPage

    const [total, favoritos] = await Promise.all([
      prisma.favorito.count({ where: { usuarioId } }),
      prisma.favorito.findMany({
        where: { usuarioId },
        skip,
        take: perPage,
        orderBy: { agregadoEn: 'desc' },
        include: {
          inmueble: {
            include: {
              ubicacion: true,
              publicaciones: {
                include: { multimedia: true },
                take: 1,
              },
            },
          },
        },
      }),
    ])

    return {
      total,
      page,
      per_page: perPage,
      inmuebles: favoritos.map((f) => f.inmueble),
    }
  }

  static async add(usuarioId: number, inmuebleId: number) {
    const existing = await prisma.favorito.findFirst({
      where: {
        usuarioId: usuarioId,
        inmuebleId: inmuebleId
      }
    })
    
    if (existing) throw new Error('ALREADY_EXISTS')

    return await prisma.favorito.create({
      data: { 
        usuarioId: usuarioId, 
        inmuebleId: inmuebleId 
      },
    })
  }

  static async remove(usuarioId: number, inmuebleId: number) {
    const existing = await prisma.favorito.findFirst({
      where: {
        usuarioId: usuarioId,
        inmuebleId: inmuebleId
      }
    })
    
    if (!existing) throw new Error('NOT_FOUND')

    return await prisma.favorito.delete({
      where: { id: existing.id },
    })
  }

  static async isFavorite(usuarioId: number, inmuebleId: number): Promise<boolean> {
    const existing = await prisma.favorito.findFirst({
      where: {
        usuarioId: usuarioId,
        inmuebleId: inmuebleId
      }
    })
    return !!existing
  }
}