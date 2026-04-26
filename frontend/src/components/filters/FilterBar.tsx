'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import {
  Home,
  Search as SearchIcon,
  DollarSign,
  Maximize,
  Award,
  SlidersHorizontal,
  ChevronDown,
  Building,
  Bed,
  Trees,
  Flower2,
  MapPin
} from 'lucide-react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { LocationSearch } from '../layout/LocationSearch'
import { ComboBox } from '../ui/ComboBox'
import TransactionModeFilter from './TransactionModeFilter'
import { useRouter } from 'next/navigation'


interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[]
    modoInmueble: string[]
    query: string
    updatedAt: string
  }) => Promise<unknown> | void
  variant?: 'home' | 'map'
  preventNavigation?: boolean
  onOpenPriceFilter?: () => void
  onOpenSuperficieFilter?: () => void
  isCapacidadActive?: boolean
  onToggleCapacidad?: () => void
  isPriceFilterActive?: boolean
  isSuperficieFilterActive?: boolean
}
type LocationValue =
  | string
  | {
    nombre?: string
    target?: {
      value?: string
    }
  }

// Botón Mock
const MockFilterBtn = ({
  icon: Icon,
  text,
  hasChevron = true,
  onClick
}: {
  icon?: ComponentType<{ className?: string }>
  text: string
  hasChevron?: boolean
  onClick?: () => void
}) => (
  <button
    type="button"
    className="h-[36px] flex items-center justify-between bg-white border border-stone-200 text-stone-600 px-3 rounded-xl shadow-sm hover:border-stone-300 transition-all font-inter text-sm whitespace-nowrap gap-2 shrink-0 focus:outline-none cursor-pointer"
    onClick={(e) => { e.preventDefault(); if (onClick) onClick() }}

  >
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-stone-500" />}
      <span>{text}</span>
    </div>
    {hasChevron && <ChevronDown className="w-4 h-4 text-stone-400" />}
  </button>
)
const trackSearchTelemetria = async (filtros: {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  zona?: string
}) => {
  try {
    await fetch('/api/telemetria/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...filtros,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.pathname : ''
      })
    })
  } catch (error) {
    console.error('Error tracking search:', error)
  }
}

export default function FilterBar({ onSearch, variant = 'home', preventNavigation = false, onOpenPriceFilter, onOpenSuperficieFilter, isCapacidadActive = false, onToggleCapacidad, isPriceFilterActive = false, isSuperficieFilterActive = false }: FilterBarProps) {

  const router = useRouter()

  const { updateFilters } = useSearchFilters()
  const [isApplying, setIsApplying] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.tipoInmueble) setTipoInmueble(parsed.tipoInmueble[0] || 'Cualquier tipo')

      if (parsed.modoInmueble) {
        setModosSeleccionados(
          Array.isArray(parsed.modoInmueble) ? parsed.modoInmueble : [parsed.modoInmueble]
        )
      }

      if (parsed.query) setUbicacionTexto(parsed.query)
    }
  }, [])

  const propertyTypes = [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Building },
    { label: 'Cuartos', icon: Bed },
    { label: 'Terrenos', icon: Trees },
    { label: 'Espacios Cementerio', icon: Flower2 }
  ]

  const advancedAmenities = ['Piscina', 'Terraza', 'Jardín', 'Cochera', 'Gimnasio', 'Ascensor', 'Aire', 'Amueblado']
  const advancedLabels = ['Inversión', 'Preventa', 'Nuevo', 'Oferta']

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const tipoMap: Record<string, string> = {
      Casas: 'CASA',
      Departamentos: 'DEPARTAMENTO',
      Terrenos: 'TERRENO',
      Cuartos: 'CUARTO',
      "Espacios Cementerio": 'TERRENO_MORTUORIO'
    }

    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== 'Cualquier tipo' ? tipoInmueble.toUpperCase() : null)

    const esTerreno = tipoFinal === 'TERRENO' || tipoFinal === 'TERRENO_MORTUORIO';

    if (esTerreno) {
      setModosSeleccionados(['VENTA']);
    }

    const modosFinales = esTerreno ? ['VENTA'] : modosSeleccionados;

    const nuevosFiltros = {
      tipoInmueble: tipoFinal ? [tipoFinal] : [],
      modoInmueble: modosFinales,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString()
    }
    await trackSearchTelemetria({
      tipoInmueble: nuevosFiltros.tipoInmueble,
      modoInmueble: nuevosFiltros.modoInmueble,
      query: nuevosFiltros.query,
      zona: ubicacionTexto
    })
    updateFilters(nuevosFiltros)

    const params = new URLSearchParams()
    try {
      const merged = JSON.parse(sessionStorage.getItem('propbol_global_filters') || '{}') as {
        locationId?: string | number
      }
      if (merged.locationId != null && merged.locationId !== '') {
        params.set('locationId', String(merged.locationId))
      }
    } catch {
      /* ignore */
    }

    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())
    if (selectedAmenities.length > 0) params.set('amenidades', selectedAmenities.join(','))
    if (selectedLabels.length > 0) params.set('etiquetas', selectedLabels.join(','))

    const queryString = params.toString()
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ''}`

    if (!preventNavigation) {
      router.push(targetUrl)
    }
    if (onSearch) await onSearch(nuevosFiltros)
  }

  const handleApply = async () => {
    if (isApplying) return
    setIsApplying(true)
    setFormMessage('')

    try {
      await handleSearch()
    } catch (error) {
      console.error('Error al aplicar filtros:', error)
      setFormMessage('No se pudo aplicar el filtro. Intenta nuevamente.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleClear = () => {
    setTipoInmueble('Cualquier tipo')
    setModosSeleccionados(['VENTA'])
    setUbicacionTexto('')
    setSelectedAmenities([])
    setSelectedLabels([])
    setShowAdvancedFilters(false)
    setFormMessage('')

    const resetFilters = {
      tipoInmueble: [],
      modoInmueble: [],
      query: '',
      updatedAt: new Date().toISOString()
    }

    updateFilters(resetFilters)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('propbol_global_filters')
    }
    if (!preventNavigation) {
      router.push('/busqueda_mapa')
    }
    if (onSearch) onSearch(resetFilters)
  }

  const handleClearAdvanced = () => {
    setSelectedAmenities([])
    setSelectedLabels([])
    setFormMessage('')
  }

  const handleApplyAdvanced = async () => {
    setShowAdvancedFilters(false)
    await handleApply()
  }

  // 🚀 FIX Z-INDEX MASIVO: Agregamos z-[99999] y !overflow-visible para aplastar al mapa
  const containerStyles =
    variant === 'map'
      ? 'bg-[#faf9f6] border-b border-stone-200 py-2 px-4 w-full flex flex-col gap-2 shadow-sm sticky top-0 z-50 !overflow-visible'
      : 'bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px] relative z-[99999] !overflow-visible'

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      {/* =========================================
          FILA SUPERIOR: Checkboxes (Protegidos con z-index)
          ========================================= */}
      <div
        className={`flex w-full relative z-[100] !overflow-visible ${variant === 'map' ? 'justify-start md:justify-center pl-2' : ''}`}
      >
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      {/* =========================================
          FILA INFERIOR: Todo lo demás
          ========================================= */}
      <div
        className={`flex items-center w-full gap-3 relative z-[90] !overflow-visible ${variant === 'map' ? 'flex-nowrap' : 'flex-col md:flex-row flex-wrap'
          }`}
      >
        {/* 🔸 Tipo (Aislado con z-[100] para que salte por encima de todo) */}
        <div
          className={`relative z-[100] !overflow-visible ${variant === 'map' ? 'w-48 shrink-0' : 'w-full md:w-64'}`}
        >
          <ComboBox
            label={variant === 'map' ? '' : 'Tipo'}
            placeholder="Cualquier tipo"
            icon={Home}
            options={propertyTypes}
            onChange={(val: string) => setTipoInmueble(val)}
            value={tipoInmueble}
          />
        </div>

        {/* 🔸 Ubicación (Z-[90] para no tapar a Tipo, pero estar encima de lo demás) */}
        <div
          className={`relative z-[90] !overflow-visible ${variant === 'map' ? 'w-[300px] shrink-0' : 'w-full flex-1'}`}
        >
          <LocationSearch
            value={ubicacionTexto}
            onChange={(val: LocationValue) => {
              const text = typeof val === 'string' ? val : val?.nombre || val?.target?.value || ''
              setUbicacionTexto(text)
            }}
          />
        </div>

        {/* 🚀 FIX AISLAMIENTO DE SCROLL: 
            Solo estos botones tienen overflow-x-auto. Así los menús de la izquierda no se cortan. */}
        {variant === 'map' && (
          <div className="flex items-center gap-3 flex-1 overflow-visible pb-1">
            <div className="shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('abrirPanelUbicacion'));
                }}
                className="h-[36px] flex items-center gap-2 px-4 rounded-xl shadow-sm transition-all text-sm font-medium focus:outline-none shrink-0 bg-[#d97706] text-white border-transparent hover:bg-[#b95e00]"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Zona</span>
              </button>
            </div>

            {/* Resto de botones existentes */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onOpenPriceFilter?.() }}
                className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border shrink-0 ${isPriceFilterActive
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
                  }`}
              >
                <DollarSign className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-500'}`} />
                <span>Precio</span>
                <ChevronDown className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-400'}`} />
              </button>
            </div>

            <div className="shrink-0">
              <CapacidadButton
                variant={variant}
                isActive={isCapacidadActive}
                onClick={onToggleCapacidad}
              />
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onOpenSuperficieFilter?.()}
                className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border shrink-0 ${isSuperficieFilterActive
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
                  }`}
              >
                <Maximize className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-500'}`} />
                <span>Metros</span>
                <ChevronDown className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-400'}`} />
              </button>
            </div>

            <div className="shrink-0">
              <MockFilterBtn icon={SlidersHorizontal} text="Más Filtros" hasChevron={false} onClick={() => setShowAdvancedFilters(true)} />
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={async () => {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                  const params = new URLSearchParams({ orden: 'recomendados' })
                  if (token) {
                    const res = await fetch(`/api/inmuebles/recomendados?${params}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    const data = await res.json()
                    console.error('Recomendados:', data)
                    if (data.success && data.data.length > 0) {
                      sessionStorage.setItem('recomendaciones_resultado', JSON.stringify(data.data))
                      router.push('/busqueda_mapa?orden=recomendados')
                    }
                  } else {
                    router.push('/busqueda_mapa?orden=recomendados')
                  }
                }}
                className="h-[36px] flex items-center justify-between bg-white border border-stone-200 text-stone-600 px-3 rounded-xl shadow-sm hover:border-orange-400 hover:text-orange-500 transition-all font-inter text-sm whitespace-nowrap gap-2 shrink-0 focus:outline-none"
              >
                <Award className="w-4 h-4 text-stone-500" />
                <span>Recomendados</span>
              </button>
            </div>
          </div>
        )}

        {variant !== 'map' && (
          <div className="flex flex-wrap items-center gap-3">
            <MockFilterBtn icon={SlidersHorizontal} text="Más Filtros" hasChevron={false} onClick={() => setShowAdvancedFilters(true)} />
          </div>
        )}

        {/* 🔸 Botón Buscar */}
        <div
          className={
            variant === 'map'
              ? 'shrink-0 ml-auto relative z-10'
              : 'w-full md:w-auto flex justify-end relative z-10'
          }
        >
          <button
            type="submit"
            className={`${variant === 'map' ? 'h-[36px] px-6 shadow-md' : 'w-full md:w-auto h-[46px] px-10'
              } bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95`}
          >
            <SearchIcon size={18} />
            {variant === 'home' && 'BUSCAR'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {formMessage ? <p className="text-sm text-red-600">{formMessage}</p> : null}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isApplying}
            className="h-[42px] px-5 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="h-[42px] px-6 rounded-xl bg-[#d97706] text-white font-semibold transition hover:bg-[#b95e00] disabled:cursor-not-allowed disabled:bg-orange-200"
          >
            {isApplying ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <p className="text-lg font-semibold text-slate-900">Filtros avanzados</p>
                <p className="text-sm text-stone-500">Selecciona amenidades y etiquetas antes de aplicar.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(false)}
                className="text-sm font-semibold text-stone-500 hover:text-stone-700"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-6 py-5">
              <div>
                <p className="mb-3 text-sm font-semibold text-stone-700">Amenidades</p>
                <div className="flex flex-wrap gap-2">
                  {advancedAmenities.map((item) => {
                    const active = selectedAmenities.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSelectedAmenities((prev) => prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item])}
                        className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'bg-[#d97706] border-[#d97706] text-white' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'}`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-stone-700">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {advancedLabels.map((item) => {
                    const active = selectedLabels.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSelectedLabels((prev) => prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item])}
                        className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'bg-[#d97706] border-[#d97706] text-white' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'}`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={handleClearAdvanced}
                className="h-[42px] px-5 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold transition hover:bg-stone-50"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleApplyAdvanced}
                disabled={isApplying}
                className="h-[42px] px-6 rounded-xl bg-[#d97706] text-white font-semibold transition hover:bg-[#b95e00] disabled:cursor-not-allowed disabled:bg-orange-200"
              >
                {isApplying ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}