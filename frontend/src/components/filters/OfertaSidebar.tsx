'use client'

import { X } from 'lucide-react'

interface OfertaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OfertaSidebar({ isOpen, onClose }: OfertaSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="p-4 relative flex items-center justify-center shrink-0">
        <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
          OFERTAS
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} className="text-stone-400" />
        </button>
      </div>

      {/* Contenido vacío por ahora */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="text-sm text-gray-500 text-center py-8">
          Aquí irán los filtros de ofertas
        </div>
      </div>
    </div>
  )
}