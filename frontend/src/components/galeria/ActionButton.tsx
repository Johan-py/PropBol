'use client'

import { Eye } from 'lucide-react'

interface ActionButtonProps {
  variant?: 'grid' | 'table'
  label?: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ActionButton({
  variant = 'grid',
  label = 'Ver detalles',
  onClick
}: ActionButtonProps) {
  // --- VISTA TABLA ---
  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Ver detalles"
        className="hover:scale-110 transition-transform duration-200"
      >
        <Eye className="w-4 h-4 text-[#E68B25] cursor-pointer" />
      </button>
    )
  }

  // --- VISTA GRILLA ---
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 text-white shadow-sm bg-[#E68B25] hover:bg-amber-700"
      title="Ver detalles"
    >
      <Eye className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}