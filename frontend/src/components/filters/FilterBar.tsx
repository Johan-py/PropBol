'use client'

import { useState } from 'react'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import {
  Search,
  DollarSign,
  Maximize,
  Award,
  SlidersHorizontal,
  ChevronDown,
  X,
  MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import TransactionModeFilter from './TransactionModeFilter'

interface FilterBarProps {
  onSearch?: (filtros: {
    query: string
    modoInmueble: string[]
    amenidades: string[]
    etiquetas: string[]
    tipoInmueble?: string[]
  }) => void

  onOpenPriceFilter?: () => void
  onOpenSuperficieFilter?: () => void
  isCapacidadActive?: boolean
  variant?: string
}

const AMENIDADES = [
  'Piscina',
  'Terraza',
  'Jardín',
  'Cochera',
  'Ascensor',
  'Amoblado'
]

const ETIQUETAS = ['Inversión', 'Preventa', 'Nuevo', 'Oferta']

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
    className={`px-3 py-1 text-xs rounded-full border transition
      ${
        active
          ? 'bg-[#c47b2a] text-white border-[#c47b2a]'
          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
      }`}
  >
    {label}
  </button>
)

export default function FilterBar({ onSearch }: FilterBarProps) {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [openMore, setOpenMore] = useState(false)
  const [amenidades, setAmenidades] = useState<string[]>([])
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [modoInmueble] = useState<string[]>(['VENTA'])

  const toggleItem = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item]
    )
  }

  const handleAplicar = () => {
    onSearch?.({
      query,
      modoInmueble,
      tipoInmueble: [], 
      amenidades,
      etiquetas
    })
    setOpenMore(false)
  }

  const handleLimpiar = () => {
    setAmenidades([])
    setEtiquetas([])
  }

  const handleBuscar = () => {
    router.push('/busqueda_mapa')
  }

  return (
    <>
      {/* OVERLAY OSCURO */}
      {openMore && (
        <div
          onClick={() => setOpenMore(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div className="w-full flex justify-center relative z-50">
        <div className="bg-white shadow-xl rounded-[22px] px-6 py-4 w-full max-w-[1200px] flex flex-col gap-4">
          {/* FILA 1 */}
          <TransactionModeFilter
            modoSeleccionado={['VENTA']}
            onModoChange={() => {}}
          />

          {/* FILA 2 (ZONA AZUL ORDENADA) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* BUSCADOR */}
            <div className="flex items-center h-[40px] px-3 border border-gray-300 rounded-xl gap-2 w-[240px] bg-white">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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

            {/* MÁS FILTROS */}
            <div className="relative">
              <button
                onClick={() => setOpenMore(true)}
                className="h-[40px] px-4 border border-gray-300 rounded-xl flex items-center gap-2 text-sm bg-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Más filtros
              </button>

              {openMore && (
                <div className="absolute top-12 left-0 w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-sm">
                      Filtros avanzados
                    </h3>
                    <button onClick={() => setOpenMore(false)}>
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    Amenidades
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {AMENIDADES.map((a) => (
                      <Chip
                        key={a}
                        label={a}
                        active={amenidades.includes(a)}
                        onClick={() =>
                          toggleItem(a, amenidades, setAmenidades)
                        }
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    Etiquetas
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ETIQUETAS.map((e) => (
                      <Chip
                        key={e}
                        label={e}
                        active={etiquetas.includes(e)}
                        onClick={() =>
                          toggleItem(e, etiquetas, setEtiquetas)
                        }
                      />
                    ))}
                  </div>

                  <div className="flex justify-between gap-2">
                    <button
                      onClick={handleLimpiar}
                      className="flex-1 h-[38px] rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={handleAplicar}
                      className="flex-1 h-[38px] rounded-xl bg-[#c47b2a] hover:bg-[#a8651f] text-white text-sm font-semibold"
                    >
                      Aplicar
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
