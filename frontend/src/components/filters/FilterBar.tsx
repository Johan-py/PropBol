'use client'

import { useEffect, useState } from 'react'
import { Home, Search as SearchIcon } from 'lucide-react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
<<<<<<< HEAD
import { LocationSearch } from '../layout/LocationSearch' // Componente de Zona
import { ComboBox } from '../ui/ComboBox' // Componente estético
import TransactionModeFilter from './TransactionModeFilter'
import { usePathname, useRouter } from 'next/navigation'
=======
import { LocationSearch } from '../layout/LocationSearch'
import { ComboBox } from '../ui/ComboBox'
import TransactionModeFilter from './TransactionModeFilter'
import { useRouter } from 'next/navigation'
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[]
    modoInmueble: string[]
    query: string
    updatedAt: string
  }) => void
  variant?: 'home' | 'map'
}

<<<<<<< HEAD
export default function FilterBar({ onSearch, variant = 'home' }: FilterBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMapPage = pathname?.includes('busqueda_mapa')

  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  // Sincronizar con filtros previos si existen en la sesión
=======
type LocationValue = string | { nombre?: string; target?: { value?: string } }

export default function FilterBar({ onSearch, variant = 'home' }: FilterBarProps) {
  const router = useRouter()
  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')

>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const tipoMap: Record<string, string> = {
      Casa: 'CASA',
      Departamento: 'DEPARTAMENTO',
      Terreno: 'TERRENO',
<<<<<<< HEAD
      'Espacios Cementerio': 'TERRENO'
    }

=======
      Cuarto: 'CUARTO',
      Espacios: 'ESPACIOS',
      Cementerio: 'CEMENTERIO'
    }
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== 'Cualquier tipo' ? tipoInmueble.toUpperCase() : null)

    const nuevosFiltros = {
      tipoInmueble: tipoInmueble !== 'Cualquier tipo' ? [tipoInmueble.toUpperCase()] : [],
      modoInmueble: modosSeleccionados,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString()
    }

    updateFilters(nuevosFiltros)
    const params = new URLSearchParams()
<<<<<<< HEAD

    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())

    const queryString = params.toString()
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ''}`

    // Ejecutar navegación
    router.push(targetUrl)

=======
    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())

    const targetUrl = `/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`
    router.push(targetUrl)
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
    if (onSearch) onSearch(nuevosFiltros)
  }

  // Estilos de contenedor principal
  const containerStyles =
    variant === 'map'
<<<<<<< HEAD
      ? 'bg-white border-b border-stone-200 p-3 flex flex-row items-center gap-4 w-full shadow-sm'
      : 'bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px]'

  return (
    <div className={containerStyles}>
      <div className={variant === 'map' ? 'shrink-0 scale-90 origin-left' : ''}>
=======
      ? 'bg-white border-b border-stone-200 p-3 flex flex-col md:flex-row items-center gap-4 w-full shadow-sm'
      : 'bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px]'

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      {/* 🔹 Modo venta/alquiler - Centrado verticalmente respecto a los inputs */}
      <div className="w-full md:w-auto self-center md:self-end md:mb-2.5">
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

<<<<<<< HEAD
      <div
        className={`flex items-end gap-3 ${variant === 'map' ? 'flex-1 flex-row' : 'flex-col md:flex-row w-full'}`}
      >
        <div className={variant === 'map' ? 'w-48' : 'w-full md:w-1/4'}>
=======
      {/* 🔹 CONTENIDO PRINCIPAL - Usamos items-end para alinear las bases de los inputs y el botón */}
      <div className="flex flex-col md:flex-row w-full gap-3 items-stretch md:items-end">
        {/* 🔸 Tipo */}
        <div className="w-full md:w-48">
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
          <ComboBox
            label={variant === 'map' ? '' : 'Tipo'}
            placeholder="Cualquier tipo"
            icon={Home}
<<<<<<< HEAD
            options={['Casa', 'Departamento', 'Terreno', 'Espacios Cementerio']}
            onChange={(val) => setTipoInmueble(val)}
=======
            options={['Casa', 'Departamento', 'Terreno', 'Cuarto', 'Espacios', 'Cementerio']}
            onChange={(val: string) => setTipoInmueble(val)}
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
          />
        </div>

        {/* 🔸 Ubicación - El LocationSearch suele tener un label arriba, items-end lo nivelará */}
        <div className="w-full flex-1">
          <LocationSearch
            value={ubicacionTexto}
<<<<<<< HEAD
            onChange={(val: any) => {
              // Captura tanto strings como objetos de autocompletado
=======
            onChange={(val: LocationValue) => {
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
              const text = typeof val === 'string' ? val : val?.nombre || val?.target?.value || ''
              setUbicacionTexto(text)
            }}
          />
        </div>

<<<<<<< HEAD
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className={`${variant === 'map' ? 'h-[40px] px-6' : 'h-[46px] px-10'} bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95`}
        >
          <SearchIcon size={18} /> {variant === 'map' ? '' : 'BUSCAR'}
        </button>
      </div>
    </div>
=======
        {/* 🔸 Botón - Ajustado para machear la altura de los inputs (aprox 46-48px) */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            className={`w-full md:w-auto h-[46px] px-5 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${variant === 'map' ? 'aspect-square md:aspect-auto' : ''}`}
          >
            <SearchIcon size={20} />
            {variant === 'home' && <span>BUSCAR</span>}
          </button>
        </div>
      </div>
    </form>
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
  )
}
