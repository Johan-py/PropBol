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
import { useRouter, useSearchParams } from 'next/navigation'
import { UbicacionEspecificaPanel } from './UbicacionEspecificaPanel';
import SuperficieFilter from './SuperficieFilter'
import AdvancedFiltersModal from './AdvancedFiltersModal'


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
    nombre: string
    lat?: number
    lng?: number
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
  precioMin?: string | null
  precioMax?: string | null
  superficieMin?: string | null
  superficieMax?: string | null
  dormitoriosMin?: string | null
  dormitoriosMax?: string | null
  banosMin?: string | null
  banosMax?: string | null
  banoCompartido?: boolean | null
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
  const searchParams = useSearchParams()
  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [isZonaOpen, setIsZonaOpen] = useState(false)

  //Estado para almacenar las coordenadas temporalmente
  const [coords, setCoords] = useState<{ lat?: number, lng?: number }>({})
  //HU6
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

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
     const urlParams = new URLSearchParams(window.location.search)
    const minPrice = urlParams.get('minPrice')
    const maxPrice = urlParams.get('maxPrice')
    const minSuperficie = urlParams.get('minSuperficie')
    const maxSuperficie = urlParams.get('maxSuperficie')
    const minDorm = urlParams.get('dormitoriosMin')
    const maxDorm = urlParams.get('dormitoriosMax')
    const minBanos = urlParams.get('banosMin')
    const maxBanos = urlParams.get('banosMax')
    const banoCompartido = urlParams.get('banoCompartido')
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

    const modosFinales = modosSeleccionados;

    const nuevosFiltros = {
      tipoInmueble: tipoFinal ? [tipoFinal] : [],
      modoInmueble: modosFinales,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString(),
      precioMin: minPrice || undefined,
      precioMax: maxPrice || undefined,
      superficieMin: minSuperficie || undefined,
      superficieMax: maxSuperficie || undefined,
      dormitoriosMin: minDorm || undefined,
      dormitoriosMax: maxDorm || undefined,
      banosMin: minBanos || undefined,
      banosMax: maxBanos || undefined,
      banoCompartido: banoCompartido === 'true' ? true : banoCompartido === 'false' ? false : undefined
    }
    await trackSearchTelemetria({
      tipoInmueble: nuevosFiltros.tipoInmueble,
      modoInmueble: nuevosFiltros.modoInmueble,
      query: nuevosFiltros.query,
      zona: ubicacionTexto, 
      precioMin: minPrice,
      precioMax: maxPrice,
      superficieMin: minSuperficie,
      superficieMax: maxSuperficie,
      dormitoriosMin: minDorm,
      dormitoriosMax: maxDorm,
      banosMin: minBanos,
      banosMax: maxBanos,
      banoCompartido: banoCompartido === 'true' ? true : banoCompartido === 'false' ? false : null
    })
    updateFilters(nuevosFiltros)

    const params = new URLSearchParams(searchParams?.toString() || '')
    // Limpiamos solo los filtros que maneja esta barra superior para evitar duplicados
    params.delete('modoInmueble')
    params.delete('tipoInmueble')
    params.delete('query')
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
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
    if (coords.lat && coords.lng) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
      params.set('radius', '1') // Radio de 1km por defecto
      params.delete('departamentoId')
      params.delete('provinciaId')
      params.delete('municipioId')
      params.delete('zonaId')
      params.delete('barrioId')
      params.delete('locationId')
    }

    const queryString = params.toString()
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ''}`

    router.push(targetUrl)
    if (onSearch) onSearch(nuevosFiltros)
  }
  // Helper para manejar el cambio de location de forma uniforme
  const handleLocationChange = (val: LocationValue) => {
    if (typeof val === 'object' && val !== null) {
      setUbicacionTexto(val.nombre)
      setCoords({ lat: val.lat, lng: val.lng })
    } else {
      setUbicacionTexto(val as string)
      setCoords({}) // Si es solo texto del historial, borramos las coordenadas
    }
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
                onChange={handleLocationChange}
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
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className="h-[40px] flex items-center gap-2 px-4 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:border-[#d97706] shadow-sm transition-all focus:outline-none shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <span>Más Filtros</span>
            </button>
            
            <button
              type="button"
              onClick={async () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                const params = new URLSearchParams()
                params.set('orden', 'recomendados')
                const urlParams = new URLSearchParams(window.location.search)
                const minPrice = urlParams.get('minPrice')
                const maxPrice = urlParams.get('maxPrice')
                const minSuperficie = urlParams.get('minSuperficie')
                const maxSuperficie = urlParams.get('maxSuperficie')
                const minDorm = urlParams.get('dormitoriosMin')
                const maxDorm = urlParams.get('dormitoriosMax')
                const tipoInmueble = urlParams.get('tipoInmueble')
                const modoInmueble = urlParams.getAll('modoInmueble')
                const query = urlParams.get('query')
    
                if (minPrice) params.set('minPrice', minPrice)
                if (maxPrice) params.set('maxPrice', maxPrice)
                if (minSuperficie) params.set('minSuperficie', minSuperficie)
                if (maxSuperficie) params.set('maxSuperficie', maxSuperficie)
                if (minDorm) params.set('dormitoriosMin', minDorm)
                if (maxDorm) params.set('dormitoriosMax', maxDorm)
                if (tipoInmueble) params.set('tipoInmueble', tipoInmueble)
                if (query) params.set('query', query)
                modoInmueble.forEach(m => params.append('modoInmueble', m))

                if (token) {
                  const res = await fetch(`/api/inmuebles/recomendados?${params}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  })
                  const data = await res.json()
                  if (data.success && data.data.length > 0) {
                    sessionStorage.setItem('recomendaciones_resultado', JSON.stringify(data.data))
                    sessionStorage.setItem('propbol_modo_recomendados', 'true')
                    router.push(`/busqueda_mapa?${params.toString()}`)
                  }
                } else {
                  router.push(`/busqueda_mapa?${params.toString()}`)
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
              onChange={handleLocationChange}
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
      {/*//HU6*/}
      <AdvancedFiltersModal 
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApply={(amenities, labels) => {
          // 1. Reconstruimos los filtros base con el estado actual
          const tipoMap: Record<string, string> = {
            Casas: 'CASA',
            Departamentos: 'DEPARTAMENTO',
            Terrenos: 'TERRENO',
            Cuartos: 'CUARTO',
            "Espacios Cementerio": 'TERRENO_MORTUORIO'
          }
          const tipoFinal = tipoMap[tipoInmueble] || (tipoInmueble !== 'Cualquier tipo' ? tipoInmueble.toUpperCase() : null)

          const filtrosActualizados = {
            tipoInmueble: tipoFinal ? [tipoFinal] : [],
            modoInmueble: modosSeleccionados,
            query: ubicacionTexto,
            updatedAt: new Date().toISOString(),
            amenities,
            labels
          }

          // 2. Actualizamos el storage global (Hook)
          updateFilters(filtrosActualizados)
          
          // 3. Sincronizamos la URL
          const params = new URLSearchParams(searchParams?.toString() || '')
          if (amenities.length > 0) params.set('amenities', amenities.join(','))
          else params.delete('amenities')
          
          if (labels.length > 0) params.set('labels', labels.join(','))
          else params.delete('labels')

          router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
          setIsAdvancedFiltersOpen(false)
          
          // 4. Disparamos la función externa si existe
          if (onSearch) onSearch(filtrosActualizados as any)
        }}
      />
    </form>
  )
}