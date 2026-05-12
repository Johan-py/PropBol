

'use client'

import { useState } from 'react'

interface PromocionarModalProps {
  abierto: boolean
  propiedadNombre: string
  propiedadId: number
  precio?: number
  onConfirmar: (propiedadId: number) => Promise<void>
  onCancelar: () => void
}

export default function PromocionarModal({
  abierto,
  propiedadNombre,
  propiedadId,
  precio = 9.99,
  onConfirmar,
  onCancelar,
}: PromocionarModalProps) {
  const [paso, setPaso] = useState<'confirmacion' | 'procesando'>('confirmacion')

  if (!abierto) return null

  const handleConfirmar = async () => {
    setPaso('procesando')
    try {
      await onConfirmar(propiedadId)
      // El éxito se maneja en el padre
    } catch (error) {
      setPaso('confirmacion')
    }
  }

  const handleCancelar = () => {
    if (paso === 'procesando') return
    setPaso('confirmacion')
    onCancelar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl mx-4">
        {paso === 'confirmacion' ? (
          <>
            <div className="px-6 pt-5 pb-2 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="text-xl font-bold text-gray-800">Publicitar propiedad</h2>
              <p className="text-sm text-gray-600 mt-1">
                ¿Quieres destacar <span className="font-semibold">"{propiedadNombre}"</span>?
              </p>
            </div>

            <hr className="h-[2px] bg-gray-800" />

            <div className="px-4 py-4 text-center">
              <p className="text-3xl font-bold text-orange-600 mb-2">${precio.toFixed(2)} USD</p>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>⭐ Aparecerá en los primeros resultados</p>
                <p>📅 Duración: 30 días</p>
                <p>📈 Mayor visibilidad para compradores</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmar}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white transition hover:from-orange-600 hover:to-orange-700"
                >
                  Continuar al pago
                </button>

                <button
                  onClick={handleCancelar}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Procesando pago</h3>
              <p className="text-sm text-gray-500 mt-1">Validando tu transacción...</p>
              <p className="text-xs text-gray-400 mt-4">Por favor, no cierres esta ventana</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}