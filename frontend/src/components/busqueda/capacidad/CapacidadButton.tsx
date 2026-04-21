// frontend/src/components/busqueda/capacidad/CapacidadButton.tsx
'use client'

import { useState } from 'react'
import { Users, ChevronDown } from 'lucide-react'
import { CapacidadFilter } from './CapacidadFilter'

interface CapacidadButtonProps {
  variant?: 'home' | 'map'
}

export function CapacidadButton({ variant = 'map' }: CapacidadButtonProps) {
  const [showCapacidad, setShowCapacidad] = useState(false)

  return (
    <div className="shrink-0 relative" style={{ zIndex: 99999 }}>
      <button
        type="button"
        onClick={() => setShowCapacidad(!showCapacidad)}
        className={`h-[36px] flex items-center justify-between border px-3 rounded-xl shadow-sm transition-all font-inter text-sm whitespace-nowrap gap-2 shrink-0 focus:outline-none
          ${
            showCapacidad
              ? 'border-[#d97706] bg-[#d97706] text-white'
              : 'border-stone-200 text-stone-600 hover:border-[#d97706]'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${showCapacidad ? 'text-white' : 'text-stone-500'}`} />
          <span>Capacidad</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showCapacidad ? 'rotate-180 text-white' : 'text-stone-400'}`}
        />
      </button>

      {/* Cuadrito que aparece DEBAJO del botón */}
      {showCapacidad && (
        <div className="absolute top-full left-0 mt-2" style={{ zIndex: 99999 }}>
          <CapacidadFilter onClose={() => setShowCapacidad(false)} />
        </div>
      )}
    </div>
  )
}
