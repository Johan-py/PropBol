'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Search, Loader2, X, History } from 'lucide-react'
import { usePopularidad } from '@/hooks/usePopularidad'
import { useSearchFilters } from '@/hooks/useSearchFilters'

type Location = {
  id: number
  nivel: string
  nombre: string
  contexto: string
}

type LocationSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const { updateFilters } = useSearchFilters()
  const { registrarConsulta } = usePopularidad()

  const recalcDropdown = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999
    })
  }

  useEffect(() => {
    if (!isOpen) return
    // CORRECCIÓN: Se usa const porque frame1 y frame2 no se reasignan
    const frame1 = requestAnimationFrame(() => {
      requestAnimationFrame(recalcDropdown)
    })
    return () => cancelAnimationFrame(frame1)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('resize', recalcDropdown)
    window.addEventListener('scroll', recalcDropdown, true)
    return () => {
      window.removeEventListener('resize', recalcDropdown)
      window.removeEventListener('scroll', recalcDropdown, true)
    }
  }, [isOpen])

  // ── Selección de ubicación ─────────────────────────────────────────────────
  const handleSelectLocation = (loc: Location) => {
    // Mostramos el nombre limpio en el input
    const displayValue = loc.nombre
    updateFilters({
      locationId: loc.id,
      query: displayValue
    })
    onChange(displayValue)
    saveToHistory(displayValue)
    setIsOpen(false)
    registrarConsulta(loc.id, displayValue)

    // Auto-submit tras elegir sugerencia
    setTimeout(() => {
      containerRef.current?.closest('form')?.requestSubmit()
    }, 100)
  }

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveToHistory = (item: string) => {
    if (!item.trim()) return 
    const updatedHistory = [item, ...history.filter((i) => i !== item)].slice(0, 20)
    setHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
  }
  
  const handleDeleteItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    const updated = history.filter((h) => h !== term)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const cleanValue = rawValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]/gi, '').trimStart()
    onChange(cleanValue)
  }

  const isSelected = value.includes('Bolivia')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchLocations = async () => {
      if (value.trim().length < 2 || isSelected) {
        setSuggestions([])
        return
      }
      setIsLoading(true)
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(value)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Error buscando ubicaciones:', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(fetchLocations, 300)
    return () => clearTimeout(timer)
  }, [value, isSelected])

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className={`h-[46px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white shadow-sm ${isOpen ? 'border-amber-600 ring-2 ring-amber-100' : 'border-stone-300'}`}>
        <MapPin className={`w-5 h-5 flex-shrink-0 ${value ? 'text-amber-600' : 'text-stone-400'}`} />
        <div className="relative flex-1 flex items-center w-full h-full min-w-0">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true)
              requestAnimationFrame(recalcDropdown)
            }}
            onKeyDown={(e) => e.key === 'Enter' && setIsOpen(false)}
            placeholder="Cochabamba, La Paz..."
            className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 font-inter pr-[70px]"
          />
          <div className="absolute right-0 flex items-center gap-2 bg-white pl-2 h-full">
            {isSelected && <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={20} height={14} className="rounded-sm flex-shrink-0" />}
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> : value && (
              <button onClick={() => onChange('')} type="button" className="p-1 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div style={dropdownStyle} className="bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          {value === '' && history.length > 0 && (
            <div className="max-h-60 overflow-y-auto overscroll-contain"> 
              <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Búsquedas recientes</span>
              </div>
              {(showAll ? history : history.slice(0, 5)).map((item, idx) => (
                <div key={`hist-${idx}`} className="group flex items-center justify-between hover:bg-amber-50 border-b border-stone-50 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item)
                      setIsOpen(false)
                      updateFilters({ query: item })
                      setTimeout(() => containerRef.current?.closest('form')?.requestSubmit(), 100)
                    }}
                    className="flex-1 px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <History className="w-3.5 h-3.5 text-stone-300" />
                    <span className="text-sm text-stone-600">{item}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, item)}
                    className="pr-4 opacity-100 md:opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {history.length > 5 && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full py-2 text-xs text-amber-600 font-bold hover:bg-amber-100 border-t border-stone-50"
                >
                  Ver más
                </button>
              )}
            </div>
          )}

          {value.trim().length >= 2 && !isSelected && (
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-6 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span className="text-sm text-stone-500 italic">Buscando zonas...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {suggestions.slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-3.5 h-3.5 text-stone-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-stone-600">
                            {loc.nombre}
                          </span>
                          <span className="text-xs text-stone-400">
                            {loc.contexto}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-500 rounded-md uppercase">
                        {loc.nivel}
                      </div>
                      <Image
                        src="https://flagcdn.com/w20/bo.png"
                        alt="BO"
                        width={20}
                        height={14}
                        className="rounded-sm"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center bg-stone-50/50">
                  <p className="text-sm text-stone-600 font-medium">No se encontraron resultados</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
