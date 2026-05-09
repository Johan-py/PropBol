'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTestimonios, toggleLikeTestimonio, type Testimonio } from '@/services/testimonio.service'

const CIUDADES = ['Todos', 'La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Potosí', 'Oruro', 'Beni', 'Pando']

export default function TestimoniosSection() {
  const [ciudadActiva, setCiudadActiva] = useState('Todos')
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likingId, setLikingId] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Sincronizar estado de sesión con localStorage
  useEffect(() => {
    const checkSession = () => setIsLoggedIn(!!localStorage.getItem('token'))
    checkSession()
    window.addEventListener('propbol:login', checkSession)
    window.addEventListener('propbol:session-changed', checkSession)
    return () => {
      window.removeEventListener('propbol:login', checkSession)
      window.removeEventListener('propbol:session-changed', checkSession)
    }
  }, [])

  const cargarTestimonios = useCallback(async (ciudad: string) => {
    setLoading(true)
    setCurrentIndex(0)
    const data = await getTestimonios(ciudad === 'Todos' ? undefined : ciudad)
    setTestimonios(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarTestimonios(ciudadActiva)
  }, [ciudadActiva, cargarTestimonios])

  // Autoplay — avanza cada 5 segundos
  useEffect(() => {
    if (testimonios.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonios.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonios.length])

  const handleCiudad = (ciudad: string) => {
    setCiudadActiva(ciudad)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonios.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonios.length - 1 ? 0 : prev + 1))
  }

  const handleLike = async (testimonio: Testimonio) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    if (likingId === testimonio.id) return
    setLikingId(testimonio.id)

    try {
      const result = await toggleLikeTestimonio(testimonio.id)
      setTestimonios((prev) =>
        prev.map((t) =>
          t.id === testimonio.id
            ? { ...t, meGusta: result.meGusta, totalLikes: result.totalLikes }
            : t
        )
      )
    } catch {
      // ignorar error silenciosamente
    } finally {
      setLikingId(null)
    }
  }

  const testimonio = testimonios[currentIndex]

  return (
    <section className="bg-white py-12 md:py-16 w-full">
      <div className="max-w-[900px] mx-auto px-4">

        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
            Historias reales de{' '}
            <span className="text-amber-600">Bolivia</span>
          </h2>
          <p className="text-xs tracking-widest text-stone-400 uppercase font-medium">
            Lo que dicen nuestros usuarios
          </p>
        </div>

        {/* Filtros de ciudad */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CIUDADES.map((ciudad) => (
            <button
              key={ciudad}
              onClick={() => handleCiudad(ciudad)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                ciudadActiva === ciudad
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {ciudad}
            </button>
          ))}
        </div>

        {/* Carrusel */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonios.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-base">No hay testimonios disponibles para esta ciudad.</p>
          </div>
        ) : (
          <>
            <div className="relative flex items-center gap-2 md:gap-4">
              {/* Flecha izquierda */}
              <button
                onClick={handlePrev}
                disabled={testimonios.length <= 1}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Tarjeta */}
              <div className="flex-1 rounded-2xl border border-stone-100 shadow-md p-6 md:p-8 bg-white min-h-[180px]">
                {/* Texto testimonio */}
                <p className="text-stone-600 italic text-center text-sm md:text-base leading-relaxed mb-6">
                  "{testimonio.comentario}"
                </p>

                {/* Footer tarjeta */}
                <div className="flex items-center justify-between gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">
                        {testimonio.usuario.iniciales}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800 leading-tight">
                        {testimonio.usuario.nombre} {testimonio.usuario.apellido}
                      </p>
                      {(testimonio.ciudad || testimonio.zona) && (
                        <p className="text-xs text-stone-400">
                          {[testimonio.ciudad, testimonio.zona].filter(Boolean).join(' – ')}
                        </p>
                      )}
                      {testimonio.categoria && (
                        <span className="inline-block mt-1 text-[10px] font-semibold tracking-wide text-stone-500 border border-stone-200 rounded px-2 py-0.5 uppercase">
                          {testimonio.categoria}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(testimonio)}
                    disabled={!isLoggedIn || likingId === testimonio.id}
                    title={!isLoggedIn ? 'Inicia sesión para dar like' : ''}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      testimonio.meGusta
                        ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'border-stone-200 text-stone-400 hover:border-amber-400 hover:text-amber-600'
                    } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${testimonio.meGusta ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{testimonio.totalLikes}</span>
                  </button>
                </div>
              </div>

              {/* Flecha derecha */}
              <button
                onClick={handleNext}
                disabled={testimonios.length <= 1}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            {testimonios.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {testimonios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentIndex
                        ? 'w-6 h-2.5 bg-amber-600'
                        : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}