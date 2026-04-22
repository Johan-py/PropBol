// frontend/src/components/filters/CapacidadSidebar.tsx
'use client'

import { X } from 'lucide-react'

interface CapacidadSideBarProps {
  isOpen: boolean
  onClose: () => void
}

export function CapacidadSideBar({ isOpen, onClose }: CapacidadSideBarProps) {
  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header con título centrado */}
      <div className="p-4 relative flex items-center justify-center shrink-0">
        <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
          CAPACIDAD
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} className="text-stone-400" />
        </button>
      </div>

      {/* Texto descriptivo debajo */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-sm text-gray-500 text-center">
          Selecciona el rango de dormitorios y baños deseados
        </p>
      </div>
    </div>
  )
}