'use client'
import ContactButton from './ContactButton' // <-- Importas tu componente
import ActionButton from './ActionButton' // <-- Importas tu componente HU4 - Botón de ver detalles (opcional, lo puedes usar o no dependiendo de tu diseño)
import { useState } from 'react'
import { normalizePropertyThumbnailUrl } from '@/lib/propertyThumbnailUrl'
import ComoLlegarButton from './ComoLlegarButton'
import { MapPin } from 'lucide-react'

export default function PropertyRow({
  title,
  precioFormateado,
  size,
  ubicacionTexto,
  categoriaTexto,
  accionTexto,
  contactType,
  image,
  lat,
  lng,
  onViewDetails
}: {
  title: string
  precioFormateado: string
  size: string
  ubicacionTexto?: string
  categoriaTexto?: string
  accionTexto?: string
  contactType: string
  image: string
  lat?: number | null
  lng?: number | null
  onViewDetails?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const imageSrc = normalizePropertyThumbnailUrl(
    image,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  )
  return (
    <div
      className="relative grid grid-cols-[56px_120px_minmax(0,1fr)_28px_28px_58px] gap-2 px-3 py-2 items-center cursor-pointer transition-colors hover:bg-stone-50 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute top-1 right-1 z-20 bg-white rounded-full shadow p-1 border border-gray-200">
          <MapPin className="w-4 h-4 text-[#ea580c]" />
        </div>
      )}
      {/* FOTO */}
      <div className="w-[56px] h-[56px] rounded-md overflow-hidden bg-gray-200">
        <img
          src={imageSrc}
          alt={title}
          width={56}
          height={56}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-house.jpg'
          }}
        />
      </div>

      {/* PRECIO */}
      <span
        className={`font-semibold transition-all duration-300 ${
          isHovered ? 'text-base text-[#ea580c]' : 'text-xs text-gray-700'
        }`}
      >
        {precioFormateado}
      </span>

      {/* DETALLE */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-xs font-semibold text-gray-800 truncate">{title}</span>
        <span className="text-[11px] text-gray-600 truncate">{size}</span>
        <span className="text-[11px] text-stone-500 line-clamp-1">
          {ubicacionTexto || 'Ubicación no especificada'}
        </span>
        <span className="text-[11px] text-stone-500 line-clamp-1">
          {`Categoría: ${categoriaTexto || '-'} · Acción: ${accionTexto || '-'}`}
        </span>
      </div>

      {/* HU4 - Botón para abrir el detalle en vista tabla */}
      <div className="flex justify-center">
        <ActionButton
          variant="table"
          onClick={(event) => {
            // HU4 - Evita disparar el click general de la tabla al hacer click en el botón de detalles
            event.stopPropagation()
            onViewDetails?.()
          }}
        />
      </div>

      {/* CONTACTO: Aquí entra tu magia limpia y modular */}
      {/* HU13 #70 - Boton Como llegar modo lista con lat/lng como props */}
      <div className="flex justify-center min-h-[44px] items-center" role="navigation" aria-label="Navegar a ubicacion de la propiedad">
        <ComoLlegarButton lat={lat} lng={lng} variant="table" />
      </div>
      <div className="flex justify-center">
        <ContactButton type={contactType} variant="table" />
      </div>
    </div>
  )
}
