'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  ChevronDown,
  DollarSign,
  MapPin,
  Maximize,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react'

import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import TransactionModeFilter from './TransactionModeFilter'

export interface SearchFiltersPayload {
  query: string
  modoInmueble: string[]
  amenidades: string[]
  etiquetas: string[]
  tipoInmueble: string[]
}

interface FilterBarProps {
  variant?: 'home' | 'map'
  onSearch?: (filtros: SearchFiltersPayload) => void
  onOpenPriceFilter?: () => void
  onOpenSuperficieFilter?: () => void
  onToggleCapacidad?: () => void
  isPriceFilterActive?: boolean
  isSuperficieFilterActive?: boolean
  isCapacidadActive?: boolean
}

const AMENIDADES = [
  'Piscina',
  'Terraza',
  'Jardin',
  'Cochera',
  'Ascensor',
  'Amoblado'
]

const ETIQUETAS = ['Inversion', 'Preventa', 'Nuevo', 'Oferta']

const Chip = ({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-xs rounded-full border transition ${
      active
        ? 'bg-[#c47b2a] text-white border-[#c47b2a]'
        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

export default function FilterBar({
  variant = 'home',
  onSearch,
  onOpenPriceFilter,
  onOpenSuperficieFilter,
  onToggleCapacidad,
  isPriceFilterActive = false,
  isSuperficieFilterActive = false,
  isCapacidadActive = false
}: FilterBarProps) {
  const router = useRouter()
  const { updateFilters } = useSearchFilters()

  const [query, setQuery] = useState('')
  const [openMore, setOpenMore] = useState(false)
  const [amenidades, setAmenidades] = useState<string[]>([])
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [modoInmueble, setModoInmueble] = useState<string[]>(['VENTA'])
  const [isApplying, setIsApplying] = useState(false)

  const toggleItem = (
    item: string,
    list: string[],
    setList: (value: string[]) => void
  ) => {
    setList(
      list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
    )
  }

  const currentFilters: SearchFiltersPayload = {
    query,
    modoInmueble,
    tipoInmueble: [],
    amenidades,
    etiquetas
  }

  const handleAplicar = () => {
    if (isApplying) return

    setIsApplying(true)
    updateFilters(currentFilters)
    onSearch?.(currentFilters)

    setTimeout(() => {
      setIsApplying(false)
      setOpenMore(false)
    }, 500)
  }

  const handleLimpiar = () => {
    setAmenidades([])
    setEtiquetas([])
  }

  const handleBuscar = () => {
    updateFilters(currentFilters)
    onSearch?.(currentFilters)
    router.push('/busqueda_mapa')
  }

  const handleOpenUbicacion = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('abrirPanelUbicacion'))
    }
  }

  if (variant === 'map') {
    return (
      <>
        {openMore && (
          <div
            onClick={() => setOpenMore(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}

        <div className="w-full flex justify-center relative z-50">
          <div className="bg-white shadow-xl rounded-[22px] px-4 py-3 w-full max-w-[1200px] flex flex-col gap-3">
            <TransactionModeFilter
              modoSeleccionado={modoInmueble}
              onModoChange={setModoInmueble}
            />

            <div className="flex items-center gap-3 flex-wrap overflow-visible pb-1">
              <div className="flex items-center h-[40px] px-3 border border-gray-300 rounded-xl gap-2 w-[240px] bg-white shrink-0">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Zona, barrio o ciudad"
                  className="outline-none text-sm w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenUbicacion}
                className="h-[36px] flex items-center gap-2 px-4 rounded-xl shadow-sm transition-all text-sm font-medium focus:outline-none shrink-0 bg-[#d97706] text-white border-transparent hover:bg-[#b95e00]"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Zona</span>
              </button>

              <button
                type="button"
                onClick={onOpenPriceFilter}
                className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border shrink-0 ${
                  isPriceFilterActive
                    ? 'bg-[#d97706] text-white border-[#d97706]'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
                }`}
              >
                <DollarSign className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-500'}`} />
                <span>Precio</span>
                <ChevronDown className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-400'}`} />
              </button>

              <CapacidadButton
                variant="map"
                isActive={isCapacidadActive}
                onClick={onToggleCapacidad}
              />

              <button
                type="button"
                onClick={onOpenSuperficieFilter}
                className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border shrink-0 ${
                  isSuperficieFilterActive
                    ? 'bg-[#d97706] text-white border-[#d97706]'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#d97706]'
                }`}
              >
                <Maximize className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-500'}`} />
                <span>Metros</span>
                <ChevronDown className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-400'}`} />
              </button>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenMore((prev) => !prev)}
                  className="h-[36px] px-4 border border-stone-200 rounded-xl flex items-center gap-2 text-sm bg-white shadow-sm text-stone-600 hover:border-[#d97706]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Mas filtros
                </button>

                {openMore && (
                  <div className="absolute top-12 left-0 w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm">Filtros avanzados</h3>
                      <button type="button" onClick={() => setOpenMore(false)}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Amenidades</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {AMENIDADES.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          active={amenidades.includes(item)}
                          onClick={() => toggleItem(item, amenidades, setAmenidades)}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Etiquetas</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ETIQUETAS.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          active={etiquetas.includes(item)}
                          onClick={() => toggleItem(item, etiquetas, setEtiquetas)}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleLimpiar}
                        className="flex-1 h-[38px] rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        disabled={isApplying}
                        onClick={handleAplicar}
                        className={`flex-1 h-[38px] rounded-xl text-white text-sm font-semibold ${
                          isApplying ? 'bg-gray-400' : 'bg-[#c47b2a] hover:bg-[#a8651f]'
                        }`}
                      >
                        {isApplying ? 'Aplicando...' : 'Aplicar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push('/busqueda_mapa?orden=recomendados')}
                className="h-[36px] flex items-center justify-between bg-white border border-stone-200 text-stone-600 px-3 rounded-xl shadow-sm hover:border-orange-400 hover:text-orange-500 transition-all text-sm whitespace-nowrap gap-2 shrink-0 focus:outline-none"
              >
                <Award className="w-4 h-4 text-stone-500" />
                <span>Recomendados</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {openMore && (
        <div
          onClick={() => setOpenMore(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div className="w-full flex justify-center relative z-50">
        <div className="bg-white shadow-xl rounded-[22px] px-6 py-4 w-full max-w-[1200px] flex flex-col gap-4">
          <TransactionModeFilter
            modoSeleccionado={modoInmueble}
            onModoChange={setModoInmueble}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center h-[40px] px-3 border border-gray-300 rounded-xl gap-2 w-[240px] bg-white">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zona, barrio o ciudad"
                className="outline-none text-sm w-full"
              />
            </div>

            <button className="h-[40px] px-4 border border-gray-300 rounded-xl flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" />
              Precio
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <CapacidadButton variant="home" />

            <button className="h-[40px] px-4 border border-gray-300 rounded-xl flex items-center gap-2 text-sm">
              <Maximize className="w-4 h-4" />
              Metros
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMore(true)}
                className="h-[40px] px-4 border border-gray-300 rounded-xl flex items-center gap-2 text-sm bg-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Mas filtros
              </button>

              {openMore && (
                <div className="absolute top-12 left-0 w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-sm">Filtros avanzados</h3>
                    <button type="button" onClick={() => setOpenMore(false)}>
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">Amenidades</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {AMENIDADES.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        active={amenidades.includes(item)}
                        onClick={() => toggleItem(item, amenidades, setAmenidades)}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">Etiquetas</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ETIQUETAS.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        active={etiquetas.includes(item)}
                        onClick={() => toggleItem(item, etiquetas, setEtiquetas)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleLimpiar}
                      className="flex-1 h-[38px] rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={handleAplicar}
                      className={`flex-1 h-[38px] rounded-xl text-white text-sm font-semibold ${
                        isApplying ? 'bg-gray-400' : 'bg-[#c47b2a] hover:bg-[#a8651f]'
                      }`}
                    >
                      {isApplying ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="h-[40px] px-4 bg-[#c47b2a] text-white rounded-xl flex items-center gap-2 text-sm">
              <Award className="w-4 h-4" />
              Recomendados
            </button>

            <button
              type="button"
              onClick={handleBuscar}
              className="ml-auto h-[40px] px-6 bg-[#c47b2a] hover:bg-[#a8651f] text-white rounded-xl font-semibold flex items-center gap-2"
            >
              <Search size={16} />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
