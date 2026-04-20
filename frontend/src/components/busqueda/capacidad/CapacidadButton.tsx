// frontend/src/components/busqueda/capacidad/CapacidadButton.tsx
'use client'

import { Users, ChevronDown } from 'lucide-react'

interface CapacidadButtonProps {
  variant?: 'home' | 'map'
  isActive?: boolean
  onClick?: () => void
}

export function CapacidadButton({ variant = 'map', isActive = false, onClick }: CapacidadButtonProps) {
  return (
    <div className="shrink-0 relative">
      <button
        type="button"
        onClick={onClick}
        className={`h-[36px] flex items-center justify-between border px-3 rounded-xl shadow-sm transition-all font-inter text-sm whitespace-nowrap gap-2 shrink-0 focus:outline-none
          ${isActive 
            ? 'border-[#d97706] bg-[#d97706] text-white' 
            : 'border-stone-200 text-stone-600 hover:border-[#d97706]'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
          <span>Capacidad</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180 text-white' : 'text-stone-400'}`} />
      </button>
    </div>
  )
}

