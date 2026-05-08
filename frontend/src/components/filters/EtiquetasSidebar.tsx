'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'

// Interfaz adaptada para manejar si no viene color
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

// Paleta de colores por defecto (estilo Tailwind) por si la BD no envía uno
const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
]

// Función auxiliar para asignar un color determinista basado en el nombre
const getFallbackColor = (nombre: string) => {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % DEFAULT_COLORS.length
  return DEFAULT_COLORS[index]
}

export default function EtiquetasSidebar({ isOpen, onClose }: EtiquetasSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [etiquetasDB, setEtiquetasDB] = useState<Etiqueta[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 1. Cargar etiquetas (F3 y F4) - Fix de dependencias aplicado
  useEffect(() => {
    if (!isOpen) return // Solo ejecuta si el panel está abierto

    const fetchEtiquetas = async () => {
      // Si ya tenemos datos, no volvemos a hacer fetch para evitar parpadeos
      if (etiquetasDB.length > 0) return 

      setIsLoading(true)
      try {
        // TODO: Reemplazar con endpoint real: const res = await fetch('/api/publicaciones/etiquetas')
        // Mock simulando datos (algunos sin color para probar el fallback)
        const mockData: Etiqueta[] = [
          { id: '1', nombre: 'Inversión', color: '#10b981', cantidad: 45 },
          { id: '2', nombre: 'Preventa', cantidad: 12 }, // Sin color
          { id: '3', nombre: 'Nuevo', color: '#f59e0b', cantidad: 89 },
          { id: '4', nombre: 'Oferta', cantidad: 5 }, // Sin color
          { id: '5', nombre: 'Remate', color: '#8b5cf6', cantidad: 2 },
          { id: '6', nombre: 'Amoblado', cantidad: 34 }, // Sin color
        ]

        // Asignamos colores por defecto a los que no traen
        const etiquetasConColor = mockData.map(etiqueta => ({
          ...etiqueta,
          color: etiqueta.color || getFallbackColor(etiqueta.nombre)
        }))

        setEtiquetasDB(etiquetasConColor)
      } catch (error) {
        // Permitido por el estándar del proyecto
        console.error('Error cargando etiquetas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEtiquetas()
  }, [isOpen]) // Dependencia única y limpia recomendada por Claude

  // 2. Sincronizar selección con la URL al abrir (F2)
  useEffect(() => {
    if (isOpen) {
      const urlLabels = searchParams.get('labels')?.split(',').filter(Boolean) || []
      setSelectedIds(urlLabels)
      setSearchQuery('') // Limpiamos buscador
    }
  }, [isOpen, searchParams])

  // 3. Filtrado local por el buscador (F5)
  const filteredEtiquetas = useMemo(() => {
    if (!searchQuery.trim()) return etiquetasDB
    const query = searchQuery.toLowerCase()
    return etiquetasDB.filter(etiqueta => 
      etiqueta.nombre.toLowerCase().includes(query)
    )
  }, [etiquetasDB, searchQuery])

  if (!isOpen) return null

  // 4. Handlers (F5 y F6)
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString()) // J1: Respeta los otros filtros
    
    if (selectedIds.length > 0) {
      params.set('labels', selectedIds.join(','))
    } else {
      params.delete('labels')
    }

    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }

  const handleClear = () => {
    setSelectedIds([])
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* HEADER */}
      <div className="shrink-0 p-4 pb-2 relative flex flex-col items-center justify-center border-b border-stone-100">
        <div className="w-full flex items-center justify-center relative mb-3">
          <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
            Filtrar por Etiquetas
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <div className="w-full relative mb-2">
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
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <span className="text-sm text-stone-400">Cargando etiquetas...</span>
          </div>
        ) : filteredEtiquetas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
            <span className="text-xl">🏷️</span>
            <p className="text-sm text-stone-500">No se encontraron etiquetas</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredEtiquetas.map((etiqueta) => {
              const isSelected = selectedIds.includes(etiqueta.id)
              return (
                <button
                  key={etiqueta.id}
                  onClick={() => toggleSelection(etiqueta.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isSelected 
                      ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: etiqueta.color }}
                  />
                  <span>{etiqueta.nombre}</span>
                  {etiqueta.cantidad !== undefined && (
                    <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-stone-600' : 'bg-stone-100'}`}>
                      {etiqueta.cantidad}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white">
        <button
          type="button"
          onClick={handleClear}
          disabled={selectedIds.length === 0}
          className="text-xs text-stone-400 hover:text-[#d97706] disabled:opacity-50 disabled:hover:text-stone-400 transition-colors underline text-center w-full mb-3"
        >
          Limpiar selección
        </button>

        <button
          onClick={handleApply}
          className="bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md flex justify-center items-center gap-2"
        >
          Aplicar Etiquetas {selectedIds.length > 0 && `(${selectedIds.length})`}
        </button>
      </div>
    </div>
  )
}