'use client'

import { useState, useEffect } from 'react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { useRouter, useSearchParams } from 'next/navigation'
interface PriceFilterSidebarProps {
  isOpen: boolean;  
<<<<<<< HEAD
  onClose: () => void
}
export default function PriceFilterSidebar({ isOpen, onClose }: PriceFilterSidebarProps) {  
=======
  onClose: () => void;
  totalResultados?: number;
}
export default function PriceFilterSidebar({ isOpen, onClose, totalResultados = -1 }: PriceFilterSidebarProps) {
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateFilters } = useSearchFilters()

<<<<<<< HEAD
  const [moneda, setMoneda] = useState<'BOB' | 'USD'>('USD')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')

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
=======
  const [moneda, setMoneda] = useState<'BOB' | 'USD'>((searchParams.get('currency') as 'BOB' | 'USD') || 'USD')
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '')
  const [error, setError] = useState<string>('')
  const [filtroAplicado, setFiltroAplicado] = useState(!!searchParams.get('minPrice') || !!searchParams.get('maxPrice'))  

  // Cargar valores iniciales desde la URL al abrir
  useEffect(() => {
    if (isOpen) {
      setMinPrice(searchParams.get('minPrice') || '')
      setMaxPrice(searchParams.get('maxPrice') || '')
      setMoneda((searchParams.get('currency') as 'BOB' | 'USD') || 'USD')
      setError('')
    }
  }, [isOpen, searchParams])
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  if (!isOpen) return null;

  const handleApply = () => {
<<<<<<< HEAD
    const nuevosFiltros = {
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      currency: moneda,
      updatedAt: new Date().toISOString()
    }

    updateFilters(nuevosFiltros)
=======
    if (Number(minPrice) < 0 || Number(maxPrice) < 0) {
      setError('Solo se permiten números positivos')
      return
    }
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('El precio mínimo no puede ser mayor al máximo')
      return
    }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')

    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')

    params.set('currency', moneda)

    router.push(`/busqueda_mapa?${params.toString()}`)
<<<<<<< HEAD
    onClose()
  }

=======
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
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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
<<<<<<< HEAD
            onClick={() => setMoneda('BOB')}
=======
            onClick={() => handleMonedaChange('BOB')}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === 'BOB'
                ? 'bg-[#d97706] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            $BOB
          </button>
          <button
<<<<<<< HEAD
            onClick={() => setMoneda('USD')}
=======
            onClick={() => handleMonedaChange('USD')}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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
<<<<<<< HEAD
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
=======
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
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Hasta:</span>
            <input
              type="number"
              placeholder="Máx"
<<<<<<< HEAD
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
=======
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
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
        </div>
<<<<<<< HEAD
      </div>

      {/* Input de Rango Visual (Opcional, usando input type="range" nativo) */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="font-bold text-xs text-stone-400 uppercase tracking-wide">
          Rango de Precio
        </label>
        <div className="flex items-center gap-2 mb-2">
          <div className="border border-stone-200 rounded-md px-3 py-1.5 text-xs text-stone-600 flex-1 text-center">
            {minPrice || '0'} {moneda}
          </div>
          <span className="text-stone-400">-</span>
          <div className="border border-stone-200 rounded-md px-3 py-1.5 text-xs text-stone-600 flex-1 text-center">
            {maxPrice || '10K'} {moneda}
          </div>
        </div>

        {/* TODO: Día 3 - reemplazar por rc-slider dual thumb */}
        <input
          type="range"
          className="w-full accent-[#d97706]"
          min="0"
          max="10000"
          step="100"
          value={maxPrice || 10000}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

=======
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

      {/* Limpiar filtro */}
      <button
        type="button"
        onClick={() => {
          setMinPrice(''); setMaxPrice(''); setError(''); setFiltroAplicado(false)
          const params = new URLSearchParams(searchParams.toString())
          params.delete('minPrice'); params.delete('maxPrice')
          params.delete('currency')
          router.push(`/busqueda_mapa?${params.toString()}`)
        }}
        className="text-xs text-stone-400 hover:text-[#d97706] transition-colors underline text-center w-full"
      >
        Limpiar filtro
      </button>

>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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