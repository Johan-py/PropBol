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
  },
  // Cambiar estado (Admin)
  async changeEstado(id: number, estado: estado_blog, razon_rechazo?: string) {
    const updateData: {
      estado: estado_blog
      fecha_publicacion?: Date | null
    } = { estado }

    if (estado === 'PUBLICADO') {
      updateData.fecha_publicacion = new Date()
    }

    const [blog] = await prisma.$transaction(async (tx) => {
      const updated = await tx.blog.update({
        where: { id },
        data: updateData
      })

      if (estado === 'RECHAZADO' && razon_rechazo) {
        await tx.blog_rechazo.create({
          data: { blog_id: id, comentario: razon_rechazo }
        })
      }

      return [updated]
    })

    return blog
  },
  // Eliminar blog (Soft delete)
  async delete(id: number) {
    return prisma.blog.update({
      where: { id },
      data: { eliminado: true }
    })
  },
  // Listar todos los blogs para administración
  async findAllAdmin(params: {
    estado?: estado_blog
    categoria_id?: number
    page?: number
    limit?: number
  }) {
    const { estado, categoria_id, page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const where = {
      eliminado: false,
      ...(estado ? { estado } : {}),
      ...(categoria_id ? { categoria_id } : {})
    }

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha_creacion: 'desc' },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, avatar: true }
          },
          categoria_blog: { select: { id: true, nombre: true } },
          blog_rechazo: { orderBy: { fecha: 'desc' }, take: 1 },
          _count: { select: { comentario: true } }
        }
      }),
      prisma.blog.count({ where })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  },
  // Listar categorías de blogs
  async findAllCategories() {
    return prisma.categoria_blog.findMany({
      orderBy: { nombre: 'asc' }
    })
  }
}

export const comentariosRepository = {
  // Crear comentario
  async create(data: {
    contenido: string
    usuario_id: number
    blog_id: number
    comentario_padre_id?: number
  }) {
    return prisma.comentario.create({
      data,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true }
        },
        _count: { select: { comentario_like: true } }
      }
    })
  },

  // Listar comentarios de un blog
  async findByBlogId(blog_id: number) {
    return prisma.comentario.findMany({
      where: { blog_id },
      orderBy: { fecha_creacion: 'asc' },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true }
        },
        _count: { select: { comentario_like: true } }
      }
    })
  },

  // Obtener comentario por id
  async findById(id: number) {
    return prisma.comentario.findUnique({ where: { id } })
  },

  // Eliminar comentario
  async delete(id: number) {
    return prisma.comentario.delete({ where: { id } })
  },

  // Toggle like en comentario
  async toggleLike(usuario_id: number, comentario_id: number) {
    const existing = await prisma.comentario_like.findUnique({
      where: { usuario_id_comentario_id: { usuario_id, comentario_id } }
    })

    if (existing) {
      await prisma.comentario_like.delete({ where: { id: existing.id } })
      return { liked: false }
    } else {
      await prisma.comentario_like.create({
        data: { usuario_id, comentario_id }
      })
      return { liked: true }
    }
  }
}
