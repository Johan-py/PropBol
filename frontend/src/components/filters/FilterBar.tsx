'use client'

import { useEffect, useState } from 'react'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import {
  Home,
  Search as SearchIcon,
  DollarSign,
  Users,
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
import { UbicacionEspecificaPanel } from './UbicacionEspecificaPanel';
import SuperficieFilter from './SuperficieFilter'


interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[]
    modoInmueble: string[]
    query: string
    updatedAt: string
  }) => void
  variant?: 'home' | 'map'
  onOpenPriceFilter?: () => void
  onOpenSuperficieFilter?: () => void
  isCapacidadActive?: boolean
  onToggleCapacidad?: () => void
  isPriceFilterActive?: boolean   
  isSuperficieFilterActive?: boolean
  isZonaFilterActive?: boolean
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
const MockFilterChip = ({
  icon: Icon,
  text,
  hasChevron = true,
  onClick
}: {
  icon?: any
  text: string
  hasChevron?: boolean
  onClick?: () => void
}) => (
  <button
    type="button"
    className="h-[40px] flex items-center gap-2 px-4 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:border-[#d97706] shadow-sm transition-all focus:outline-none shrink-0"
  >
    {Icon && <Icon className="w-4 h-4 text-stone-500" />}
    <span>{text}</span>
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

export default function FilterBar({ onSearch, variant = 'home', onOpenPriceFilter, onOpenSuperficieFilter, isCapacidadActive = false, onToggleCapacidad, isPriceFilterActive = false, isSuperficieFilterActive = false, isZonaFilterActive = false }: FilterBarProps) {

  const router = useRouter()

  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [isZonaOpen, setIsZonaOpen] = useState(false)

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

    const queryString = params.toString()
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ''}`

    router.push(targetUrl)
    if (onSearch) onSearch(nuevosFiltros)
  }

  // 🚀 FIX Z-INDEX MASIVO: Agregamos z-[99999] y !overflow-visible para aplastar al mapa
  const containerStyles =
    variant === 'map'
      ? 'bg-[#faf9f6] border-b border-stone-200 py-2 px-4 w-full flex flex-col gap-2 shadow-sm sticky top-0 z-50 !overflow-visible'
      : 'bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px] relative z-[99999] !overflow-visible'

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      
      <div className={`flex w-full relative z-[100] !overflow-visible ${variant === 'map' ? 'justify-center' : ''}`}>
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      {variant === 'map' && (
        <div className="flex flex-col gap-3 w-full">
          
          {/* FILA 2: Buscadores Principales */}
          <div className="flex items-center w-full gap-3 relative z-[90] !overflow-visible">
            <div className="w-48 xl:w-56 shrink-0 relative z-[100] !overflow-visible">
              <ComboBox
                label=""
                placeholder="Cualquier tipo"
                icon={Home}
                options={propertyTypes}
                onChange={(val: string) => setTipoInmueble(val)}
                value={tipoInmueble}
              />
            </div>
            
            <div className="flex-1 min-w-0 relative z-[90] !overflow-visible">
              <LocationSearch
                value={ubicacionTexto}
                onChange={(val: LocationValue) => {
                  const text = typeof val === 'string' ? val : val?.nombre || val?.target?.value || ''
                  setUbicacionTexto(text)
                }}
              />
            </div>

            <div className="shrink-0 relative z-10">
              <button
                type="submit"
                className="h-[42px] px-6 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <SearchIcon size={18} />
              </button>
            </div>
          </div>

          {/* FILA 3: Filtros Rápidos (Estilo Píldora Grande) */}
          <div className="flex flex-wrap items-center gap-3 relative z-[80]">
            
            {/* Chip Zona (Activo por defecto como en tu diseño) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('abrirPanelUbicacion'));
              }}
              className={`h-[40px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${
                isZonaFilterActive
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
              }`}
            >
              <MapPin className={`w-4 h-4 ${isZonaFilterActive ? 'text-white' : 'text-stone-500'}`} />
              <span>Zona</span>
            </button>

            {/* Chip Precio */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onOpenPriceFilter?.() }}
              className={`h-[40px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${
                isPriceFilterActive
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
              }`}
            >
              <DollarSign className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-500'}`} />
              <span>Precio</span>
              <ChevronDown className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-400'}`} />
            </button>

            {/* Chip Capacidad (Llamada al componente externo) */}
            <div className="shrink-0">
              <CapacidadButton
                variant={variant}
                isActive={isCapacidadActive}
                onClick={onToggleCapacidad}
              />
            </div>

            {/* Chip Metros */}
            <button
              type="button"
              onClick={() => onOpenSuperficieFilter?.()}
              className={`h-[40px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${
                isSuperficieFilterActive
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
              }`}
            >
              <Maximize className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-500'}`} />
              <span>Metros</span>
              <ChevronDown className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-400'}`} />
            </button>

            {/* Chips Adicionales */}
            <MockFilterChip icon={SlidersHorizontal} text="Más Filtros" hasChevron={false} />
            
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
                  if (data.success && data.data.length > 0) {
                    sessionStorage.setItem('recomendaciones_resultado', JSON.stringify(data.data))
                    router.push('/busqueda_mapa?orden=recomendados')
                  }
                } else {
                  router.push('/busqueda_mapa?orden=recomendados')
                }
              }}
              className="h-[40px] flex items-center gap-2 px-4 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:border-[#d97706] shadow-sm transition-all focus:outline-none shrink-0"
            >
              <Award className="w-4 h-4 text-stone-500" />
              <span>Recomendados</span>
            </button>
          </div>
        </div>
      )}

      {/* ── RENDERIZADO ORIGINAL PARA HOME ── */}
      {variant === 'home' && (
        <div className="flex items-center w-full gap-3 relative z-[90] !overflow-visible flex-col md:flex-row flex-wrap">
          <div className="relative z-[100] !overflow-visible w-full md:w-64">
            <ComboBox
              label="Tipo"
              placeholder="Cualquier tipo"
              icon={Home}
              options={propertyTypes}
              onChange={(val: string) => setTipoInmueble(val)}
              value={tipoInmueble}
            />
          </div>
          <div className="relative z-[90] !overflow-visible w-full flex-1">
            <LocationSearch
              value={ubicacionTexto}
              onChange={(val: LocationValue) => {
                const text = typeof val === 'string' ? val : val?.nombre || val?.target?.value || ''
                setUbicacionTexto(text)
              }}
            />
          </div>
          <div className="w-full md:w-auto flex justify-end relative z-10">
            <button
              type="submit"
              className="w-full md:w-auto h-[46px] px-10 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <SearchIcon size={18} /> BUSCAR
            </button>
          </div>
        </div>
      )}
    </form>
  )
}