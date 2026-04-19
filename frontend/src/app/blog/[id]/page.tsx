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
