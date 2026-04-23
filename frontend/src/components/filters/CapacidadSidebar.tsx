'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { RangeSliderControl } from '../busqueda/capacidad/RangeSliderControl'

interface CapacidadSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (dormitoriosMin: number, dormitoriosMax: number, banosMin: number, banosMax: number) => void
}

export function CapacidadSidebar({ isOpen, onClose, onApply }: CapacidadSidebarProps) {
  const [dormitoriosMin, setDormitoriosMin] = useState(1)
  const [dormitoriosMax, setDormitoriosMax] = useState(10)
  const [banosMin, setBanosMin] = useState(1)
  const [banosMax, setBanosMax] = useState(8)

  if (!isOpen) return null

  const handleApply = () => {
    if (onApply) {
      onApply(dormitoriosMin, dormitoriosMax, banosMin, banosMax)
    }
    onClose()
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
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

      {/* Texto descriptivo */}
      <div className="px-4 pt-0 pb-2">
        <p className="text-sm text-gray-500 text-center">
          Selecciona el rango de dormitorios y baños deseados
        </p>
      </div>

      {/* Sliders */}
      <div className="px-4 pt-4 space-y-6  mb-14">
        <RangeSliderControl
          label="dormitorios"
          minValue={dormitoriosMin}
          maxValue={dormitoriosMax}
          absoluteMin={1}
          absoluteMax={10}
          onMinChange={setDormitoriosMin}
          onMaxChange={setDormitoriosMax}
          unit="+"
        />

        <RangeSliderControl
          label="banos"
          minValue={banosMin}
          maxValue={banosMax}
          absoluteMin={1}
          absoluteMax={8}
          onMinChange={setBanosMin}
          onMaxChange={setBanosMax}
          unit="+"
        />
      </div>

      {/* Botón Aplicar */}
      <div className="px-4 pb-4 mt-4">
        <button
          onClick={handleApply}
          className="w-full py-2 text-white bg-[#d97706] rounded-lg hover:bg-[#b95e00] transition-colors font-medium"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}