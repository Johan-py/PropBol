'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'

export interface Etiqueta {
  id: string
  nombre: string
  color?: string
  cantidad?: number
}

interface EtiquetasSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
]

const getFallbackColor = (nombre: string) => {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length]
}

export default function EtiquetasSidebar({ isOpen, onClose }: EtiquetasSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [etiquetasDB, setEtiquetasDB] = useState<Etiqueta[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchEtiquetas = async () => {
      if (etiquetasDB.length > 0) return
      setIsLoading(true)
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')
        const res = await fetch(`${API_URL}/api/parametros`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json = await res.json()

        const etiquetas: Etiqueta[] = (json.data || []).map((item: { id: number; nombre: string }) => ({
          id: String(item.id),
          nombre: item.nombre ?? '',
          color: getFallbackColor(item.nombre ?? ''),
        }))
        setEtiquetasDB(etiquetas)
        const nombresMap: Record<string, string> = {}

        etiquetas.forEach((e) => {
          nombresMap[e.id] = e.nombre
        })

        sessionStorage.setItem(
          'propbol_etiquetas_nombres',
          JSON.stringify(nombresMap)
        )
      } catch (error) {
        console.error('Error cargando etiquetas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEtiquetas()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const urlLabels = searchParams.get('labels')?.split(',').filter(Boolean) || []
      setSelectedIds(urlLabels)
      setSearchQuery('')
    }
  }, [isOpen, searchParams])

  // Seleccionadas: etiquetas con datos completos
  const selectedEtiquetas = useMemo(
    () => etiquetasDB.filter(e => selectedIds.includes(e.id)),
    [etiquetasDB, selectedIds]
  )

  // Disponibles: excluye las ya seleccionadas + aplica buscador
  const availableEtiquetas = useMemo(() => {
    const sinSeleccionadas = etiquetasDB.filter(e => !selectedIds.includes(e.id))
    if (!searchQuery.trim()) return sinSeleccionadas
    const query = searchQuery.toLowerCase()
    return sinSeleccionadas.filter(e => e.nombre.toLowerCase().includes(query))
  }, [etiquetasDB, selectedIds, searchQuery])

  if (!isOpen) return null

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleApply = () => {
    if (selectedIds.length === 0) {
      setShowEmptyWarning(true)
      setTimeout(() => setShowEmptyWarning(false), 2500)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('labels', selectedIds.join(','))
    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('labels')
    setSelectedIds([])
    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">

      {/* HEADER */}
      <div className="shrink-0 p-4 pb-3 border-b border-stone-100">
        <div className="w-full flex items-center justify-center relative mb-1">
          <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
            Filtrar por Etiquetas
          </h3>
          <button onClick={onClose} className="absolute right-0 p-1 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <p className="text-sm text-stone-500 text-center mb-3">
          Seleccione una o varias etiquetas para refinar la búsqueda
        </p>

        <div className="w-full relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all bg-stone-50"
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-5">

        {/* SELECCIONADAS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              Seleccionadas
            </span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-[#d97706] font-medium hover:opacity-75 transition-opacity"
              >
                Limpiar
              </button>
            )}
          </div>

          {selectedEtiquetas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3 text-center">
              <p className="text-sm text-stone-400">No has seleccionado ninguna etiqueta</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedEtiquetas.map(etiqueta => (
                <span
                  key={etiqueta.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-sm font-medium text-stone-700"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: etiqueta.color }} />
                  {etiqueta.nombre}
                  <button
                    onClick={() => toggleSelection(etiqueta.id)}
                    className="w-4 h-4 rounded-full hover:bg-stone-100 flex items-center justify-center ml-0.5 transition-colors"
                  >
                    <X size={10} className="text-stone-500" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* DISPONIBLES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              Disponibles
            </span>
            <span className="text-xs text-stone-400">{availableEtiquetas.length} disponibles</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <span className="text-sm text-stone-400">Cargando etiquetas...</span>
            </div>
          ) : availableEtiquetas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 gap-2 text-center">
              <span className="text-lg">🏷️</span>
              <p className="text-sm text-stone-400">
                {searchQuery.trim() ? 'Sin resultados para tu búsqueda' : 'Todas las etiquetas están seleccionadas'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableEtiquetas.map(etiqueta => (
                <button
                  key={etiqueta.id}
                  onClick={() => toggleSelection(etiqueta.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border bg-white text-stone-600 border-stone-200 hover:border-[#d97706] hover:text-stone-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: etiqueta.color }} />
                  <span>{etiqueta.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white flex flex-col gap-3">
        
        {/* Notificación sutil cuando presiona Aplicar sin selección */}
        {showEmptyWarning && (
          <p className="text-xs text-[#d97706] text-center animate-pulse">
            Selecciona al menos una etiqueta para filtrar
          </p>
        )}

        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-stone-400 hover:text-[#d97706] transition-colors underline text-center w-full"
        >
          Limpiar filtro
        </button>

        {/* Siempre naranja, sin disabled */}
        <button
          onClick={handleApply}
          className="w-full bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold py-3 px-4 transition-all active:scale-95 shadow-md"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}