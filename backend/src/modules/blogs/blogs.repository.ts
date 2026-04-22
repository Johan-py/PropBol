import { prisma } from '../../lib/prisma.client.js'
import { estado_blog } from '@prisma/client'

// BLOGS PE

export const blogsRepository = {
  // Listar blogs PUBLICADOS con filtros opcionales y paginación
  async findAll(params: { categoria_id?: number; page?: number; limit?: number }) {
    const { categoria_id, page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const where = {
      eliminado: false,
      estado: 'PUBLICADO' as estado_blog,
      ...(categoria_id ? { categoria_id } : {})
    }

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha_publicacion: 'desc' },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, avatar: true }
          },
          categoria_blog: { select: { id: true, nombre: true } },
          _count: { select: { comentario: true } }
        }
      }),
      prisma.blog.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}
