'use client'

import { useState } from 'react'
import { publicacionService } from '@/services/publicacionn.service'

interface Props {
  abierto: boolean
  publicacionId: number
  tituloPub: string
  onCerrar: () => void
  onConfirmado: () => void
}

export default function CancelarPublicidadModal({ abierto, publicacionId, tituloPub, onCerrar, onConfirmado }: Props) {
  const [paso, setPaso] = useState<'confirmacion' | 'exito'>('confirmacion')
  const [loading, setLoading] = useState(false)

  if (!abierto) return null

  const confirmar = async () => {
    setLoading(true)
    await publicacionService.cancelarPublicidad(publicacionId)
    setLoading(false)
    setPaso('exito')
  }

  const cerrarYReiniciar = () => {
    setPaso('confirmacion')
    onCerrar()
  }

  const aceptarExito = () => {
    setPaso('confirmacion')
    onConfirmado()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl">

        {paso === 'confirmacion' && (
          <>
            <div className="px-6 py-4 text-center">
              <div className="mb-1 text-3xl">⚠️</div>
              <h2 className="text-lg font-semibold text-gray-800">Cancelar publicidad</h2>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                ¿Estás seguro de cancelar la publicidad de "{tituloPub}"?
              </p>
            </div>

            <hr className="h-[2px] bg-gray-200" />

            <div className="px-4 py-4 space-y-2 text-sm text-gray-600">
              <p>❌ La propiedad dejará de aparecer destacada</p>
              <p>📉 Volverá a la posición estándar en búsquedas</p>
            </div>

            <div className="flex gap-3 px-4 pb-5">
              <button
                type="button"
                onClick={cerrarYReiniciar}
                disabled={loading}
                className="h-11 flex-1 rounded-lg border border-[#9a9a9a] bg-white text-sm font-medium text-[#2c2c2c] transition hover:bg-gray-50"
              >
                No, mantener
              </button>
              <button
                type="button"
                onClick={confirmar}
                disabled={loading}
                className="h-11 flex-1 rounded-lg bg-red-600 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </>
        )}

        {paso === 'exito' && (
          <>
            <div className="px-6 py-4 text-center">
              <div className="mb-1 text-3xl">✅</div>
              <h2 className="text-lg font-semibold text-gray-800">Publicidad cancelada</h2>
              <p className="mt-1 text-sm text-gray-500">
                La propiedad ya no aparecerá destacada en los resultados de búsqueda.
              </p>
            </div>

            <hr className="h-[2px] bg-gray-200" />

            <div className="px-4 py-5">
              <button
                type="button"
                onClick={aceptarExito}
                className="h-11 w-full rounded-lg bg-[#D97706] text-sm font-medium text-white transition hover:bg-[#bf6905]"
              >
                Entendido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
