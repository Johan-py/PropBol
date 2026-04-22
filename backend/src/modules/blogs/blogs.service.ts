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
  }
}
