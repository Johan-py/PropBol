import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import BlogCommentsSection from '@/components/blog/BlogCommentsSection'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'
import { MOCK_USER_BLOGS } from '@/lib/mock/blogs.mock'
import { getPublishedBlogById } from '@/services/blogs.service'

const buildArticleSections = (title: string, excerpt: string, content?: string) => [
  {
    heading: 'Panorama actual',
    paragraphs: [
      excerpt,
      `Este articulo sobre "${title}" abre una conversacion relevante para quienes siguen de cerca la evolucion del sector inmobiliario. La propuesta combina contexto, tendencias y decisiones practicas que ayudan a interpretar mejor el momento del mercado.`,
      'A lo largo del texto se desarrollan ideas que no solo inspiran, sino que tambien sirven como punto de partida para que la comunidad comparta experiencias, dudas y distintas perspectivas.'
    ]
  },
  {
    heading: 'Por que importa en PropBol',
    paragraphs: [
      'Desde la experiencia de usuario, este tipo de contenido fortalece la toma de decisiones porque conecta informacion especializada con escenarios reales de compra, inversion y estilo de vida.',
      'La seccion de comentarios permite ampliar esa lectura inicial con observaciones de otras personas, preguntas concretas y respuestas que enriquecen la conversacion del post.'
    ]
  }
]

const formatPublishedDate = (value: string) =>
  new Date(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const publicBlog = await getPublishedBlogById(params.id)
  const userBlog = MOCK_USER_BLOGS.find((blog) => blog.id === params.id)

  if (!publicBlog && !userBlog) {
    notFound()
  }

  const title = publicBlog?.title ?? userBlog?.titulo ?? 'Blog PropBol'
  const imageUrl = publicBlog?.imageUrl ?? userBlog?.imagenUrl ?? '/placeholder-blog.jpg'
  const authorName = publicBlog?.authorName ?? userBlog?.autor ?? 'Usuario PropBol'
  const publishedLabel = publicBlog
    ? formatPublishedDate(publicBlog.publishedAt)
    : userBlog?.fecha ?? 'Fecha no disponible'
  const summary =
    publicBlog?.excerpt ??
    userBlog?.resumen ??
    'Este articulo presenta una mirada clara y actual sobre el ecosistema inmobiliario y las oportunidades que aparecen cuando observamos el mercado con criterio.'
  const articleSections = buildArticleSections(title, summary, publicBlog?.content)

  return (
    <article className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f8f3eb_38%,#ffffff_100%)] pb-20">
      <header className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a56400]">
            Blog PropBol
          </p>

          <h1 className="font-heading mt-4 text-4xl font-black leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="mt-8 flex items-center gap-4 border-b border-stone-200 pb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
              {authorName.charAt(0).toUpperCase()}
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-bold text-stone-900">{authorName}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                {publishedLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[32px] bg-stone-100 shadow-[0_24px_80px_-32px_rgba(41,37,36,0.35)]">
          <img
            src={imageUrl}
            alt={title}
            className="h-full min-h-[240px] w-full object-cover sm:min-h-[360px]"
          />
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-white/90 p-6 shadow-[0_24px_80px_-50px_rgba(41,37,36,0.45)] sm:p-8 lg:p-10">
          <p className="text-lg font-medium leading-8 text-stone-700 sm:text-xl">{summary}</p>

          <div className="mt-8 space-y-10">
            {articleSections.map((section) => (
              <section key={section.heading} className="space-y-5">
                <h2 className="font-heading text-2xl font-bold text-stone-900 sm:text-3xl">
                  {section.heading}
                </h2>

                <div className="space-y-5 text-base leading-8 text-stone-600 sm:text-lg">
                  {section.heading === 'Panorama actual' && publicBlog?.content ? (
                    <MarkdownRenderer content={publicBlog.content} />
                  ) : (
                    section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        <BlogCommentsSection blogId={params.id} />

        <div className="pt-12">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500 transition-colors hover:text-[#a56400]"
          >
            <ChevronLeft size={18} />
            Volver a blogs
          </Link>
        </div>
      </main>
    </article>
  )
}
