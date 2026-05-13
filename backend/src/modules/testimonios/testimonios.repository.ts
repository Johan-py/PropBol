import { prisma } from '../../lib/prisma.client.js'

export const testimoniosRepository = {
  async findAll(params: { ciudad?: string; usuarioId?: number }) {
    const { ciudad, usuarioId } = params

    const where = {
      visible: true,
      eliminado: false,
      ...(ciudad && ciudad !== 'Todos' ? { ciudad } : {})
    }

    const testimonios = await prisma.testimonio.findMany({
      where,
      orderBy: { fecha_creacion: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true
          }
        },
        likes: true
      }
    })

    return testimonios.map((t) => ({
      id: t.id,
      comentario: t.comentario,
      calificacion: t.calificacion,
      ciudad: t.ciudad,
      zona: t.zona,
      categoria: t.categoria,
      fecha_creacion: t.fecha_creacion,
      usuario: {
        id: t.usuario.id,
        nombre: t.usuario.nombre,
        apellido: t.usuario.apellido,
        avatar: t.usuario.avatar,
        iniciales:
          `${t.usuario.nombre[0] ?? ''}${t.usuario.apellido[0] ?? ''}`.toUpperCase()
      },
      totalLikes: t.likes.length,
      meGusta: usuarioId
        ? t.likes.some((l) => l.usuarioId === usuarioId)
        : false
    }))
  },

  async findById(id: number) {
    return prisma.testimonio.findUnique({ where: { id } })
  },

  async findLike(testimonioId: number, usuarioId: number) {
    return prisma.testimonioLike.findUnique({
      where: { testimonioId_usuarioId: { testimonioId, usuarioId } }
    })
  },

  async createLike(testimonioId: number, usuarioId: number) {
    return prisma.testimonioLike.create({
      data: { testimonioId, usuarioId }
    })
  },

  async deleteLike(id: number) {
    return prisma.testimonioLike.delete({ where: { id } })
  },

  async countLikes(testimonioId: number) {
    return prisma.testimonioLike.count({ where: { testimonioId } })
  }
}