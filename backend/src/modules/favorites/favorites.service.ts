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
                where: { estado: 'ACTIVA' },
                orderBy: { fechaPublicacion: 'desc' },
                take: 1,
                include: {
                  multimedia: {
                    where: { tipo: 'IMAGEN' },
                    take: 1
                  }
                }
              },
              inmueble_etiqueta: {
                include: { etiqueta: true }
              }
            }
          }
        }
      })
    ])

    return {
      total,
      page,
      per_page: perPage,
      inmuebles: favoritos.map((f) => {
        const inmueble = f.inmueble
        const publicacion = inmueble.publicaciones[0] ?? null
        const imagen = publicacion?.multimedia[0]?.url ?? null

        return {
          id: inmueble.id,
          titulo: inmueble.titulo,
          precio: inmueble.precio,
          tipoAccion: inmueble.tipoAccion,
          categoria: inmueble.categoria,
          nroCuartos: inmueble.nroCuartos,
          nroBanos: inmueble.nroBanos,
          superficieM2: inmueble.superficieM2,
          estado: inmueble.estado,
          descripcion: inmueble.descripcion,
          imagen,
          ubicacion: inmueble.ubicacion,
          etiquetas: inmueble.inmueble_etiqueta.map((ie) => ie.etiqueta),
          agregadoEn: f.agregadoEn
        }
      })
    }
  }

  static async add(usuarioId: number, inmuebleId: number) {
    const existing = await prisma.favorito.findFirst({
      where: { usuarioId, inmuebleId }
    })
    if (existing) throw new Error('ALREADY_EXISTS')

    return await prisma.favorito.create({
      data: { usuarioId, inmuebleId }
    })
  }

  static async remove(usuarioId: number, inmuebleId: number) {
    const existing = await prisma.favorito.findFirst({
      where: { usuarioId, inmuebleId }
    })
    if (!existing) throw new Error('NOT_FOUND')

    return await prisma.favorito.delete({
      where: { id: existing.id }
    })
  }

  static async isFavorite(usuarioId: number, inmuebleId: number): Promise<boolean> {
    const existing = await prisma.favorito.findFirst({
      where: { usuarioId, inmuebleId }
    })
    return !!existing
  }
}
