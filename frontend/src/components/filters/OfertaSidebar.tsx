// frontend/src/components/filters/OfertaSidebar.tsx
'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface OfertaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OfertaSidebar({ isOpen, onClose }: OfertaSidebarProps) {
  const [soloOfertas, setSoloOfertas] = useState(true)

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header - SIN borde abajo */}
      <div className="p-4 relative flex items-center justify-center shrink-0">
        <h3 className="font-bold text-sm text-black uppercase tracking-wide text-center">
          OFERTAS
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} className="text-stone-400" />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-5 pt-1 space-y-5">
        
        {/* Checkbox: Solo propiedades con precio reducido */}
        <div>
          <label className="flex items-center gap-4 text-sm text-stone-750 font-normal cursor-pointer ">
            <div className="relative inline-flex shadow-sm">
              <input
                type="checkbox"
                checked={soloOfertas}
                onChange={() => setSoloOfertas(!soloOfertas)}
                className={`
                  w-[28px] h-[18px] rounded border cursor-pointer appearance-none
                  ${soloOfertas
                    ? 'bg-[#d97706] border-[#d97706]'
                    : 'bg-white border-gray-400'
                  }
                `}
              />
              {soloOfertas && (
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              )}
            </div>
            <span>Solo propiedades con precio reducido</span>
          </label>
        </div>

        <div>
        <h3 className= "font-bold text-xs text-black uppercase tracking-wide">
          Etiquetas de Ofertas
        </h3>
      </div>

      </div>

      

      {/* Botones */}
      <div className="p-4 border-t border-stone-100 shrink-0 flex gap-3">
        <button
          onClick={() => setSoloOfertas(false)}
          className="flex-1 py-2.5 text-gray-500 text-sm underline underline-offset-4 hover:text-gray-700 transition-colors"
        >
          Limpiar filtro
        </button>
        <button
          onClick={() => {
            console.log('Aplicar filtro:', soloOfertas)
          }}
          className="flex-1 py-2.5 text-white bg-[#d97706] rounded-lg hover:bg-[#b95e00] transition-colors font-medium"
        >
          Aplicar filtro
        </button>
      </div>
    </div>
  )
}