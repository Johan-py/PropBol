'use client'

import { useState } from 'react'
import {
  Home,
  Search as SearchIcon,
  DollarSign,
  Maximize,
  SlidersHorizontal,
  Award,
  ChevronDown,

  
  Building,
  Bed,
  Trees,
  Flower2
} from 'lucide-react'

import { ComboBox } from '../ui/ComboBox'
import { LocationSearch } from '../layout/LocationSearch'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import TransactionModeFilter from './TransactionModeFilter'

import { useRouter } from 'next/navigation'
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


}
type LocationValue =
  | string
  | {
    nombre?: string
    target?: {
      value?: string
    }
  }

type IconType = React.ComponentType<{ className?: string }>

const Btn = ({
  icon: Icon,
  text,
  onClick
}: {
  icon?: IconType
  text: string
  onClick?: () => void
}) => (
  <button
    type="button"

    {Icon && <Icon className="w-4 h-4" />}
    {text}
    <ChevronDown className="w-4 h-4 text-gray-400" />
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

export default function FilterBar({ onSearch, variant = 'home', onOpenPriceFilter, onOpenSuperficieFilter, isCapacidadActive = false, onToggleCapacidad }: FilterBarProps) {


 
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [openMore, setOpenMore] = useState(false)

  const propertyTypes = [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Home },
    { label: 'Terrenos', icon: Home }
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
    <div className="w-full flex justify-center">
      <div className="bg-white shadow-xl rounded-[25px] p-5 w-full max-w-[1100px] flex flex-col gap-4">


            </div>
          </div>

          {/* DERECHA */}
          <div className="shrink-0">
            <TransactionModeFilter
              modoSeleccionado={['VENTA']}
              onModoChange={() => { }}
            />
          </div>
        </div>

        {/* 🔹 FILA 2: BOTONES EN UNA SOLA LINEA */}
        <div className="flex items-center gap-3 flex-wrap">
          <Btn icon={DollarSign} text="Precio" />
          <CapacidadButton variant="home" />

          <button

          >
            <Maximize className="w-4 h-4" />
            Metros
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* MÁS FILTROS (ABRE POPOVER) */}
          <div className="relative">
            <Btn
              icon={SlidersHorizontal}
              text="Más filtros"
              onClick={() => setOpenMore((v) => !v)}
            />

            {openMore && (
              <div className="absolute top-12 left-0 w-[320px] bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Amenidades
                  </h3>
                  <button onClick={() => setOpenMore(false)}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* 🔥 AQUÍ VAN LAS AMENIDADES */}
                <AmenityChips />

                {/* 🔹 ETIQUETAS */}
                <div className="flex gap-2 flex-wrap mt-3">
                  {['Inversión', 'Preventa', 'Oferta', 'Nuevo'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Btn icon={Award} text="Recomendados" />

          <button className="h-[40px] px-6 bg-[#c47b2a] hover:bg-[#a8651f] text-white rounded-xl font-semibold flex items-center gap-2 ml-auto">
            <SearchIcon size={16} />
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}