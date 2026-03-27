'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownProps<T> {
  label: string
  icon?: React.ReactNode
  opciones: { label: string; valor: T }[]
  valorActual: T
  onChange: (valor: T) => void
}

export const DropdownOrden = <T extends string | number | symbol>({
  label,
  icon,
  opciones,
  valorActual,
  onChange
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar al clickear afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = opciones.find((opt) => opt.valor === valorActual)
  const isActiveGroup = selectedOption !== undefined

  return (
    <div className="relative inline-block w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex w-full items-center justify-between gap-x-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-200 border border-gray-200
          ${
            isActiveGroup
              ? 'bg-gray-50 text-orange-500 hover:bg-gray-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {icon}
          {isActiveGroup && selectedOption ? selectedOption.label : label}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActiveGroup ? 'text-orange-500' : 'text-gray-400'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-full min-w-[200px] origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition transform ease-out duration-100">
          <div className="py-1">
            {opciones.map((opcion) => (
              <button
                key={String(opcion.valor)}
                onClick={() => {
                  onChange(opcion.valor)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center px-4 py-2 text-sm text-left transition-colors
                  ${valorActual === opcion.valor ? 'bg-orange-50 text-orange-500 font-semibold' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <div className="flex-grow">{opcion.label}</div>
                {valorActual === opcion.valor && (
                  <Check className="h-4 w-4 text-orange-500 ml-2" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
