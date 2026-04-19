import React from 'react'
import { MOCK_USER_BLOGS } from '@/lib/mock/blogs.mock'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  // Buscamos el blog en nuestros mocks por el ID
  const blog = MOCK_USER_BLOGS.find((b) => b.id === params.id)

  if (!blog) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-white pb-20">
      {/* Botón Volver */}
      <header className="max-w-4xl mx-auto px-6 pt-10">
        {/* Título Gigante */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {blog.titulo}
        </h1>

        {/* Cabecera: Autor y Fecha */}
        <div className="flex items-center gap-4 mt-8 pb-8 border-b border-gray-100">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {blog.autor ? blog.autor[0] : 'U'}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">
              {blog.autor || 'Usuario PropBol'}
            </span>
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              {blog.fecha}
            </span>
          </div>
        </div>
        <div className="mt-10 relative w-full aspect-video overflow-hidden rounded-3xl shadow-lg bg-gray-100">
          <img src={blog.imagenUrl} alt={blog.titulo} className="w-full h-full object-cover" />
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link
          href="/profile"
          className="flex items-center text-gray-500 hover:text-blue-600 transition-colors gap-1 text-sm font-medium"
        >
          <ChevronLeft size={18} />
          Volver a mis blogs
        </Link>
      </div>
    </article>
  )
}
