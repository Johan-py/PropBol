import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  crearBlog,
  listarBlogs,
  obtenerBlog,
  misBlogs,
  actualizarBlog,
  eliminarBlog,
  cambiarEstadoBlog,
  listarBlogsAdmin,
  listarCategorias,
  crearComentario,
  listarComentarios,
  toggleLikeComentario,
  eliminarComentario
} from './blogs.controller.js'

const router = Router()

// Rutas de Blogs
router.get('/categorias', listarCategorias)
router.get('/admin', requireAuth, listarBlogsAdmin)
router.post('/', requireAuth, crearBlog)
router.get('/', listarBlogs)
router.get('/mis-blogs', requireAuth, misBlogs)
router.get('/:id', obtenerBlog)
router.patch('/:id', requireAuth, actualizarBlog)
router.delete('/:id', requireAuth, eliminarBlog)
router.patch('/:id/estado', requireAuth, cambiarEstadoBlog)

// Rutas de Comentarios
router.post('/comentarios', requireAuth, crearComentario)
router.get('/:id/comentarios', listarComentarios)
router.post('/comentarios/:id/like', requireAuth, toggleLikeComentario)
router.delete('/comentarios/:id', requireAuth, eliminarComentario)

export default router
