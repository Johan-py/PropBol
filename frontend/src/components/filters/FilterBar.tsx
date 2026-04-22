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
  X
} from 'lucide-react'

import { ComboBox } from '../ui/ComboBox'
import { LocationSearch } from '../layout/LocationSearch'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import TransactionModeFilter from './TransactionModeFilter'
import AmenityChips from './AmenityChips'

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
    onClick={onClick}
    className="h-[38px] flex items-center gap-2 px-4 rounded-xl border bg-white text-gray-700 border-gray-200 hover:border-gray-300 text-sm"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {text}
    <ChevronDown className="w-4 h-4 text-gray-400" />
  </button>
)

export default function FilterBar() {
  const [tipoInmueble, setTipoInmueble] = useState('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [openMore, setOpenMore] = useState(false)

  const propertyTypes = [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Home },
    { label: 'Terrenos', icon: Home }
  ]

  return (
    <div className="w-full flex justify-center">
      <div className="bg-white shadow-xl rounded-[25px] p-5 w-full max-w-[1100px] flex flex-col gap-4">

        {/* 🔹 FILA 1: BUSQUEDA (IZQ) + MODOS (DER) */}
        <div className="flex items-center gap-3">
          {/* IZQUIERDA */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-[200px]">
              <ComboBox
                label="Tipo"
                placeholder="Cualquier tipo"
                icon={Home}
                options={propertyTypes}
                onChange={(val: string) => setTipoInmueble(val)}
                value={tipoInmueble}
              />
            </div>

            <div className="flex-1 min-w-[250px]">
              <LocationSearch
                value={ubicacionTexto}
                onChange={(val: LocationValue) => {
                  const text =
                    typeof val === 'string'
                      ? val
                      : val?.nombre || val?.target?.value || ''
                  setUbicacionTexto(text)
                }}
              />
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
            type="button"
            className="h-[38px] flex items-center gap-2 px-4 rounded-xl border bg-white text-gray-700 border-gray-200"
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