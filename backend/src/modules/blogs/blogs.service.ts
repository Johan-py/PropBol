import { estado_blog } from '@prisma/client'
import { blogsRepository, comentariosRepository } from './blogs.repository.js'

// BLOGS SERVICE PE

export const blogsService = {
  async listar(params: { categoria_id?: number; page?: number; limit?: number }) {
    return blogsRepository.findAll(params)
  },

  async misBlogs(usuario_id: number) {
    return blogsRepository.findByUserId(usuario_id)
  },

  async obtener(id: number) {
    const blog = await blogsRepository.findById(id)
    if (!blog) throw new Error('BLOG_NOT_FOUND')
    return blog
  },
  async crear(
    usuario_id: number,
    data: {
      titulo: string
      contenido: string
      imagen?: string
      categoria_id: number
      accion: 'borrador' | 'pendiente'
    }
  ) {
    const estado: estado_blog = data.accion === 'pendiente' ? 'PENDIENTE' : 'BORRADOR'

    return blogsRepository.create({
      titulo: data.titulo,
      contenido: data.contenido,
      imagen: data.imagen,
      categoria_id: data.categoria_id,
      usuario_id,
      estado
    })
  },
  async actualizar(
    id: number,
    usuario_id: number,
    data: {
      titulo?: string
      contenido?: string
      imagen?: string
      accion?: 'borrador' | 'pendiente'
    }
  ) {
    const blog = await blogsRepository.findById(id)
    if (!blog) throw new Error('BLOG_NOT_FOUND')
    if (blog.usuario_id !== usuario_id) throw new Error('FORBIDDEN')
    if (blog.estado !== 'BORRADOR' && blog.estado !== 'RECHAZADO') {
      throw new Error('BLOG_NOT_EDITABLE')
    }

    const estado: estado_blog | undefined =
      data.accion === 'pendiente'
        ? 'PENDIENTE'
        : data.accion === 'borrador'
          ? 'BORRADOR'
          : undefined

    return blogsRepository.update(id, {
      titulo: data.titulo,
      contenido: data.contenido,
      imagen: data.imagen,
      ...(estado ? { estado } : {})
    })
  }
}
