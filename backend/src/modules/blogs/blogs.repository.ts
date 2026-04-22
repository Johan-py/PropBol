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
  },
  // Mis blogs (todos los estados del autor)
  async findByUserId(usuario_id: number) {
    return prisma.blog.findMany({
      where: { usuario_id, eliminado: false },
      orderBy: { fecha_creacion: 'desc' },
      include: {
        categoria_blog: { select: { id: true, nombre: true } },
        blog_rechazo: { orderBy: { fecha: 'desc' }, take: 1 },
        _count: { select: { comentario: true } }
      }
    })
  },
  // Obtener blog por id
  async findById(id: number) {
    return prisma.blog.findFirst({
      where: { id, eliminado: false },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true }
        },
        categoria_blog: { select: { id: true, nombre: true } },
        blog_rechazo: { orderBy: { fecha: 'desc' } },
        _count: { select: { comentario: true } }
      }
    })
  },
  // Crear blog
  async create(data: {
    titulo: string
    contenido: string
    imagen?: string
    estado: estado_blog
    categoria_id: number
    usuario_id: number
  }) {
    return prisma.blog.create({
      data: {
        ...data,
        fecha_publicacion: data.estado === 'PUBLICADO' ? new Date() : null
      }
    })
  },
  // Actualizar contenido del blog (solo si BORRADOR o RECHAZADO)
  async update(
    id: number,
    data: {
      titulo?: string
      contenido?: string
      imagen?: string
      estado?: estado_blog
    }
  ) {
    return prisma.blog.update({ where: { id }, data })
  }
}
