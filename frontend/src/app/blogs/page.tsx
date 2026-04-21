'use client'

import { useEffect, useState } from 'react'
import BlogCard from '@/components/blog/BlogCard'
import MyRecentBlogsPanel from '@/components/blog/MyRecentBlogsPanel'
import BlogFilterChips from '@/components/blog/BlogFilterChips'
import FeaturedBlogSpotlight from '@/components/blog/FeaturedBlogSpotlight'
import { useBlogFeed } from '@/hooks/useBlogFeed'

const USER_STORAGE_KEY = 'propbol_user'

export default function BlogsPage() {
  const {
    activeCategory,
    categories,
    featuredBlog,
    secondaryBlogs,
    canLoadMore,
    hasResults,
    toggleCategory,
    loadMore
  } = useBlogFeed()

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem(USER_STORAGE_KEY)))
    }

    syncAuthState()
    window.addEventListener('storage', syncAuthState)
    window.addEventListener('propbol:session-changed', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('propbol:session-changed', syncAuthState)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f5efe7_45%,#ffffff_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ✅ Panel de blogs recientes (feature/blogsRecientes) */}
        <MyRecentBlogsPanel />

        {/* HEADER */}
        <section className="space-y-6">
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">
            Perspectivas para el Bien Raiz Moderno.
          </h1>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-x-auto pb-1">
              <BlogFilterChips
                categories={categories}
                activeCategory={activeCategory}
                onToggleCategory={toggleCategory}
              />
            </div>

            <button
              type="button"
              disabled={!isAuthenticated}
              aria-disabled={!isAuthenticated}
              title={
                isAuthenticated
                  ? 'La creacion de blogs se habilitara cuando el flujo este integrado.'
                  : 'Disponible solo para usuarios registrados.'
              }
              className={`inline-flex min-h-[54px] items-center justify-center self-start px-8 text-sm font-semibold uppercase tracking-[0.22em] transition-colors lg:self-auto ${
                isAuthenticated
                  ? 'bg-[#a56400] text-white hover:bg-[#8e5800]'
                  : 'cursor-not-allowed bg-[#a56400] text-white/75 opacity-80'
              }`}
            >
              AÑADIR POST
            </button>
          </div>
        </section>

        {hasResults && featuredBlog ? (
          <FeaturedBlogSpotlight blog={featuredBlog} />
        ) : (
          <section className="rounded-[32px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-400">
              Sin resultados
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold text-stone-900">
              No encontramos articulos en esta categoria por ahora.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">
              Prueba con otra etiqueta para seguir explorando las publicaciones disponibles.
            </p>
          </section>
        )}

        <section className="space-y-6">
          {secondaryBlogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {secondaryBlogs.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>
          ) : hasResults ? (
            <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-10 text-center text-stone-600 shadow-sm">
              Esta categoria solo tiene un articulo destacado por el momento.
            </div>
          ) : null}

          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full border border-amber-600 px-6 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-600 hover:text-white"
              >
                CONTINUAR LEYENDO
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
