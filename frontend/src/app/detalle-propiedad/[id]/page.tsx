'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { useDetallePropiedad } from '@/hooks/useDetallePropiedad'
import { useFavorite } from '@/hooks/useFavorite'
import GaleriaPropiedad from '@/components/detalle-propiedad/GaleriaPropiedad'
import ResumenPropiedad from '@/components/detalle-propiedad/ResumenPropiedad'
import DescripcionPropiedad from '@/components/detalle-propiedad/DescripcionPropiedad'
import DetallesPropiedad from '@/components/detalle-propiedad/DetallesPropiedad'
import UbicacionPropiedad from '@/components/detalle-propiedad/UbicacionPropiedad'
import ContactoPropiedad from '@/components/detalle-propiedad/ContactoPropiedad'

export default function DetallePropiedadPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  // Registra la vista de la propiedad
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (!id || isNaN(id)) return

    fetch(`${API_URL}/api/publicacion/${id}/view`, {
      method: 'POST'
    })
  }, [id])

  const { detalle, loading, error } = useDetallePropiedad(id)

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(Boolean(token))
    }

    syncAuth()

    window.addEventListener('storage', syncAuth)
    window.addEventListener('propbol:login', syncAuth as EventListener)
    window.addEventListener('propbol:logout', syncAuth as EventListener)

    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('propbol:login', syncAuth as EventListener)
      window.removeEventListener('propbol:logout', syncAuth as EventListener)
    }
  }, [])

  const { isFavorite, isLoadingStatus, isSubmitting, toggleFavorite } = useFavorite({
    inmuebleId: detalle?.inmuebleId ?? 0,
    isAuthenticated,
    onRequireAuth: () => {
      // Favoritos requiere sesión iniciada
      alert('Debes iniciar sesión para guardar esta propiedad en favoritos')
      router.push('/sign-in')
    }
  })

  if (loading) {
    return <div className="px-4 py-8">Cargando detalle de propiedad...</div>
  }

  if (error) {
    return <div className="px-4 py-8 text-red-600">{error}</div>
  }

  if (!detalle) {
    return <div className="px-4 py-8">No se encontró la propiedad.</div>
  }

  return (
    <main className="min-h-screen bg-[#ede7dc]">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isLoadingStatus || isSubmitting}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
              isFavorite ? 'bg-[#fff0f6] text-[#E68B25]' : 'text-[#d67a00] hover:bg-[#f3ece2]'
            } ${isLoadingStatus || isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#E68B25] text-[#E68B25]' : ''}`} />
            {isLoadingStatus || isSubmitting
              ? 'Procesando...'
              : isFavorite
                ? 'Guardado'
                : 'Añadir a favoritos'}
          </button>
        </div>

        <GaleriaPropiedad imagenes={detalle.imagenes} titulo={detalle.titulo} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="space-y-5">
            <ResumenPropiedad detalle={detalle} />
            <DescripcionPropiedad descripcion={detalle.descripcion} />
            <DetallesPropiedad detalle={detalle} />
            <UbicacionPropiedad mapa={detalle.mapa} />
          </div>

          <div className="lg:sticky lg:top-16 lg:self-start">
            <ContactoPropiedad contacto={detalle.contacto} />
          </div>
        </div>
      </div>
    </main>
  )
}
