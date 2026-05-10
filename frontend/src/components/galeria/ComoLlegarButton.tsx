'use client'
import { MapPin } from 'lucide-react'
import { useMapRedirect } from '@/hooks/useMapRedirect'

interface ComoLlegarButtonProps {
  lat?: number | null
  lng?: number | null
  variant?: 'grid' | 'table'
}

export default function ComoLlegarButton({
  lat,
  lng,
  variant = 'grid'
}: ComoLlegarButtonProps) {
  const { openMap } = useMapRedirect()
  const hasLocation = lat != null && lng != null

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (hasLocation) openMap(lat!, lng!)
  }

  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasLocation}
        title={hasLocation ? '¿Cómo llegar?' : 'Ubicación no disponible'}
        className="hover:scale-110 transition-transform duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MapPin className="w-4 h-4 text-[#ea580c]" />
      </button>
    )
  }

  return (
    <div className="relative w-full group/btn">
      {!hasLocation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block z-50">
          <div className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap">
            Ubicación no disponible
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={!hasLocation}
        className="flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 text-white shadow-sm bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed disabled:shadow-none"
        title={hasLocation ? '¿Cómo llegar?' : 'Ubicación no disponible'}
      >
        <MapPin className="w-5 h-5" />
        <span>¿Cómo llegar?</span>
      </button>
    </div>
  )
}
