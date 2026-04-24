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
  const [isAuth, setIsAuth] = useState(false)
  const { updateFilters } = useSearchFilters()
  const { registrarConsulta } = usePopularidad()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const recalcDropdown = () => {
    if (!containerRef.current) return
    setDropdownStyle({
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      width: '100%',
      zIndex: 50
    })
  }

  // Sincronización de dimensiones y eventos de cierre
  useEffect(() => {
    if (!isOpen) return
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

  // --- PERSISTENCIA: Carga Inicial Sincronizada ---
  useEffect(() => {
    const initHistory = async () => {
      // 1. Cargar local primero para rapidez visual
      const saved = localStorage.getItem('searchHistory')
      if (saved) setHistory(JSON.parse(saved))

      // 2. Si el usuario está autenticado, sincronizar con el servidor
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          if (res.ok) {
            const data = await res.json()
            // Asumiendo que el backend devuelve un array de strings o de objetos {termino: string}
            const remoteHistory = data.map((h: any) => typeof h === 'string' ? h : h.termino)
            
            // SINCRONIZACIÓN: Guardar en el backend las búsquedas locales que no estén en el remoto
            const localHistory = saved ? JSON.parse(saved) : [];
            const missingInRemote = localHistory.filter((item: string) => !remoteHistory.includes(item));
            
            if (missingInRemote.length > 0) {
              // Enviamos al backend desde la más antigua a la más nueva para mantener el orden
              for (const item of [...missingInRemote].reverse()) {
                try {
                  await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ termino: item })
                  });
                } catch (e) {
                  console.error("Error sincronizando historial local:", e);
                }
              }
              // Unimos la historia local que no estaba y la remota, y guardamos hasta 20 items
              const newHistory = [...missingInRemote, ...remoteHistory].slice(0, 20);
              setHistory(newHistory);
              localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            } else {
              setHistory(remoteHistory)
              localStorage.setItem('searchHistory', JSON.stringify(remoteHistory))
            }
          } else if (res.status === 401) {
            console.warn("Sesión expirada o token inválido para historial")
            setIsAuth(false)
          }
        } catch (error) {
          console.error("Error cargando historial remoto:", error)
        }
      }
    }
    initHistory()
  }, [isAuth]) // Depende de isAuth para recargar cuando el usuario inicia sesión

  // --- PERSISTENCIA: Guardar ---
  const saveToHistory = async (item: string) => {
    if (!item.trim()) return

    const updatedHistory = [item, ...history.filter((i) => i !== item)].slice(0, 20)
    setHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))

    const token = localStorage.getItem("token")
    if (token) {
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ termino: item })
        })
      } catch (error) {
        console.error("Error guardando en BD:", error)
      }
    }
  }

  // --- PERSISTENCIA: Eliminar ---
  const handleDeleteItem = async (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    
    // UI Primero (Optimista)
    const updated = history.filter((h) => h !== term)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))

    const token = localStorage.getItem("token")
    if (token) {
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda/${encodeURIComponent(term)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (error) {
        console.error("Error eliminando en BD:", error)
      }
    }
  }

  const handleSelectLocation = (loc: Location) => {
    const displayValue = loc.nombre
    updateFilters({
      locationId: loc.id,
      query: displayValue
    })
    onChange(displayValue)
    saveToHistory(displayValue)
    setIsOpen(false)
    registrarConsulta(loc.id, displayValue)

    setTimeout(() => {
      containerRef.current?.closest('form')?.requestSubmit()
    }, 100)
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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsAuth(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsAuth(res.ok)
      } catch (error) {
        setIsAuth(false)
      }
    }
    checkAuth()
  }, [])

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
                      saveToHistory(item) 
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
              {history.length > 5 && (
                <div className="flex justify-end border-t border-stone-50">
                <button
                  type="button"
                    onClick={() => setShowAll(!showAll)}
                    className={`px-4 py-2 text-xs font-bold transition-colors ${
                      showAll ? "text-stone-500 hover:text-stone-700" : "text-amber-600 hover:text-amber-700"
                    }`}
                  >
                    {showAll ? "Ver menos" : "Ver más"}
                </button>
                </div>
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
                          <span className="text-sm font-bold text-stone-600">{loc.nombre}</span>
                          <span className="text-xs text-stone-400">{loc.contexto}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-500 rounded-md uppercase">
                        {loc.nivel}
                      </div>
                      <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={20} height={14} className="rounded-sm" />
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