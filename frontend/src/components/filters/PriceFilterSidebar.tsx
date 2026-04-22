'use client'

import { useState, useEffect } from 'react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { useRouter, useSearchParams } from 'next/navigation'
interface PriceFilterSidebarProps {
  isOpen: boolean;  
  onClose: () => void;
  totalResultados?: number;
}
export default function PriceFilterSidebar({ isOpen, onClose, totalResultados = -1 }: PriceFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateFilters } = useSearchFilters()

  const [moneda, setMoneda] = useState<'BOB' | 'USD'>('USD')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [filtroAplicado, setFiltroAplicado] = useState(false)  

  // Cargar valores iniciales si existen en la URL o SessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.minPrice) setMinPrice(parsed.minPrice)
      if (parsed.maxPrice) setMaxPrice(parsed.maxPrice)
      if (parsed.currency) setMoneda(parsed.currency)
    }
  }, [])

  if (!isOpen) return null;

  const handleApply = () => {
    if (Number(minPrice) < 0 || Number(maxPrice) < 0) {
      setError('Solo se permiten números positivos')
      return
    }
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('El precio mínimo no puede ser mayor al máximo')
      return
    }
    const nuevosFiltros = {
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      currency: moneda,
      updatedAt: new Date().toISOString()
    }

    updateFilters(nuevosFiltros)

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')

    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')

    params.set('currency', moneda)

    router.push(`/busqueda_mapa?${params.toString()}`)
    setFiltroAplicado(true)
    onClose()
  }

  const LIMITE_MAX = moneda === 'USD' ? 500000 : 3500000

  const formatearMiles = (valor: string): string => {
    if (!valor) return ''
    return Number(valor).toLocaleString('es-BO')
  }
  const handleMonedaChange = (nuevaMoneda: 'BOB' | 'USD') => {
    setMoneda(nuevaMoneda)
    setMinPrice('')
    setMaxPrice('')
    setError('')
  }
  return (
    <div className="flex flex-col gap-8 p-6 w-full bg-white h-full overflow-y-auto">
      <div>
        <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide mb-1 text-center">
          Filtrar por Precio
        </h3>
        <p className="text-sm text-stone-500 mb-4 text-center">Seleccione el tipo de moneda:</p>

        {/* Toggle de Moneda */}
        <div className="flex bg-stone-100 rounded-full p-1 w-fit mb-6 shadow-inner mx-auto">
          <button
            onClick={() => handleMonedaChange('BOB')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === 'BOB'
                ? 'bg-[#d97706] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            $BOB
          </button>
          <button
            onClick={() => handleMonedaChange('USD')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === 'USD'
                ? 'bg-[#d97706] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            $USD
          </button>
        </div>

        {/* Inputs Desde / Hasta */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Desde:</span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => {
                const val = e.target.value
                if (Number(val) < 0) { setError('Solo se permiten números positivos'); return }
                setError('')
                setMinPrice(val)
              }}
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
              onPaste={(e) => {
                const texto = e.clipboardData.getData('text')
                if (!/^\d*\.?\d*$/.test(texto)) { e.preventDefault(); setError('Formato no válido') }
              }}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Hasta:</span>
            <input
              type="number"
              placeholder="Máx"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                const val = e.target.value
                if (Number(val) < 0) { setError('Solo se permiten números positivos'); return }
                setError('')
                setMaxPrice(val)
              }}
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
              onPaste={(e) => {
                const texto = e.clipboardData.getData('text')
                if (!/^\d*\.?\d*$/.test(texto)) { e.preventDefault(); setError('Formato no válido') }
              }}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
        {!error && minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
          <p className="text-red-500 text-xs mt-1">
            El precio mínimo no puede ser mayor al máximo
          </p>
        )}
      </div>

      {/* Día 3 - sliders bidireccionales sincronizados con inputs */}
      <div className="flex flex-col gap-3 mt-2">
        <label className="font-bold text-xs text-stone-400 uppercase tracking-wide">
          Rango de Precio
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 w-8">Min</span>
          <input
            type="range" min="0" max={LIMITE_MAX} step="100"
            value={Number(minPrice) || 0}
            onChange={(e) => { setMinPrice(e.target.value); setError('') }}
            className="flex-1 accent-[#d97706]"
          />
          <span className="text-xs text-stone-600 w-20 text-right">
            {formatearMiles(minPrice) || '0'} {moneda}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 w-8">Máx</span>
          <input
            type="range" min="0" max={LIMITE_MAX} step="100"
            value={Number(maxPrice) || LIMITE_MAX}
            onChange={(e) => { setMaxPrice(e.target.value); setError('') }}
            className="flex-1 accent-[#d97706]"
          />
          <span className="text-xs text-stone-600 w-20 text-right">
            {maxPrice ? formatearMiles(maxPrice) : `${(LIMITE_MAX/1000).toLocaleString('es-BO')}K`} {moneda}
          </span>
        </div>
      </div>

      {/* Día 7 - Empty state cuando no hay resultados */}
      {filtroAplicado && totalResultados === 0 && (
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <span className="text-xl">🔍</span>
          <p className="text-sm font-semibold text-stone-700">Sin resultados</p>
          <p className="text-xs text-stone-400">
            No se encontraron propiedades dentro del rango de precio seleccionado
          </p>
        </div>
      )}

      {/* Botón Aplicar */}
      <button
        onClick={handleApply}
        className="mt-6 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md"
      >
        Aplicar
      </button>
    </div>
  )
}