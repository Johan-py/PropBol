'use client'
import ContactButton from './ContactButton' // <-- Importas tu componente
import ActionButton from './ActionButton' // <-- Importas tu componente HU4 - Botón de ver detalles (opcional, lo puedes usar o no dependiendo de tu diseño)
import Image from 'next/image'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

export default function PropertyRow({
  title,
  precioFormateado,
  size,
  contactType,
  image,
  onViewDetails
}: {
  title: string
  precioFormateado: string
  size: string
  contactType: string
  image: string
  onViewDetails?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      className="relative grid grid-cols-[40px_70px_minmax(0,1fr)_20px_50px] gap-2 px-3 py-2 items-center cursor-pointer transition-colors hover:bg-stone-50 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute top-1 right-1 z-20 bg-white rounded-full shadow p-1 border border-gray-200">
          <MapPin className="w-4 h-4 text-[#ea580c]" />
        </div>
      )}
      {/* FOTO */}
      <div className="w-[40px] h-[40px] rounded-md overflow-hidden bg-gray-200">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>

      {/* PRECIO */}
      <span
        className={`font-semibold transition-all duration-300 ${
          isHovered ? 'text-sm text-[#ea580c]' : 'text-[11px] text-gray-700'
        }`}
      >
        {precioFormateado}
      </span>

      {/* DETALLE */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-[11px] font-medium text-gray-800 truncate">{title}</span>
        <span className="text-[10px] text-gray-500">{size}</span>
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
      <div className="flex justify-center">
        <ContactButton type={contactType} variant="table" />
      </div>
    </div>
  )
}
