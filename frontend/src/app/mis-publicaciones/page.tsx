'use client'

import { Lock, AlertTriangle } from 'lucide-react'
import PublicacionCard from '@/components/publicacion/PublicacionCard'
import { useMisPublicaciones } from '@/hooks/useMisPublicaciones'

export default function MisPublicacionesPage() {
  const { publicaciones, loading, error, removerPublicacionDeLista } = useMisPublicaciones()

  if (loading) {
    return <div className="px-4 py-8 sm:px-6 lg:px-8">Cargando publicaciones...</div>
  }

  if (error) {
    return <div className="px-4 py-8 text-red-600 sm:px-6 lg:px-8">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Banner de Suscripción */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row">
          <div>
            <p className="text-[15px] text-gray-900">
              <strong>Mi Plan actual: Básico (Gratis)</strong>
            </p>
            <p className="mt-1 text-[14px] text-gray-700">
              <strong>**Publicaciones Activas:**</strong> 2 / 2 (Límite gratis alcanzado)
            </p>
          </div>

          <div className="flex flex-col items-end">
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-[#c4c4c4] px-4 py-2 text-[14px] font-medium text-white transition-colors"
            >
              <Lock size={16} />
              Crear Nueva Publicación
              <AlertTriangle size={16} className="text-[#f5a623]" />
            </button>
            <p className="mt-2 max-w-[260px] text-right text-[12px] leading-tight text-gray-600">
              (Límite alcanzado! Actualiza tu plan para añadir más propiedades.
            </p>
          </div>
        </div>

        {/* Lista de Publicaciones */}
        {publicaciones.length === 0 ? (
          <p className="text-gray-600">No tienes publicaciones activas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {publicaciones.map((publicacion) => (
              <div key={publicacion.id} className="mx-auto w-full">
                <PublicacionCard publicacion={publicacion} onDeleted={removerPublicacionDeLista} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
