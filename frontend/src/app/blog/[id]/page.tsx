import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import BlogCommentsSection from '@/components/blog/BlogCommentsSection'
import { MOCK_USER_BLOGS } from '@/lib/mock/blogs.mock'
import { MOCK_PUBLIC_BLOGS } from '@/lib/mock/publicBlogs.mock'
import { getPublishedBlogs } from '@/services/blogs.service'

type BlogDetailContent = {
  id: string
  titulo: string
  autor: string
  fecha: string
  imagenUrl: string
  resumen: string
}

function formatPublishedDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function resolveBlogDetail(id: string): Promise<BlogDetailContent | null> {
  const publishedBlogs = await getPublishedBlogs(50)
  const publicBlog =
    publishedBlogs.find((blog) => blog.id === id) ??
    MOCK_PUBLIC_BLOGS.find((blog) => blog.id === id)

  if (publicBlog) {
    return {
      id: publicBlog.id,
      titulo: publicBlog.title,
      autor: publicBlog.authorName || 'Usuario PropBol',
      fecha: formatPublishedDate(publicBlog.publishedAt),
      imagenUrl: publicBlog.imageUrl,
      resumen: publicBlog.excerpt
    }
  }

  const userBlog = MOCK_USER_BLOGS.find((blog) => blog.id === id)

  if (!userBlog) {
    return null
  }

  return {
    id: userBlog.id,
    titulo: userBlog.titulo,
    autor: userBlog.autor || 'Usuario PropBol',
    fecha: userBlog.fecha,
    imagenUrl: userBlog.imagenUrl,
    resumen:
      userBlog.resumen ||
      'Este es un resumen del articulo que captura la atencion del lector desde el primer momento.'
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const blog = await resolveBlogDetail(params.id)

  if (!blog) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-white pb-20">
      <header className="mx-auto max-w-4xl px-6 pt-10">
        <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
          {blog.titulo}
        </h1>

        <div className="mt-8 flex items-center gap-4 border-b border-gray-100 pb-8">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-600">
              {blog.autor ? blog.autor[0] : 'U'}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{blog.autor}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {blog.fecha}
            </span>
          </div>
        </div>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
          <img src={blog.imagenUrl} alt={blog.titulo} className="h-full w-full object-cover" />
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-3xl px-6">
        <div className="space-y-6 text-lg leading-relaxed text-gray-700">
          <p className="text-xl font-medium italic text-gray-800">{blog.resumen}</p>

          <p>
            En esta lectura exploramos como las nuevas narrativas del mercado inmobiliario,
            la arquitectura y el estilo de vida se cruzan para definir decisiones mas
            informadas en PropBol.
          </p>

          <h2 className="pt-4 text-2xl font-bold text-gray-900">
            El impacto en el mercado actual
          </h2>

          <p>
            La evolucion del sector ya no se explica solo por precio o ubicacion. Tambien
            importan el diseno, la experiencia del usuario y la capacidad de cada proyecto
            para responder a nuevas formas de vivir e invertir.
          </p>
        </div>
      </main>

      <BlogCommentsSection blogId={blog.id} />

      <div className="mx-auto max-w-4xl px-6 pt-12">
        <Link
          href="/blogs"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
        >
          <ChevronLeft size={18} />
          Volver a blogs
        </Link>
      </div>
    </article>
  )
}
