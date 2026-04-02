'use client'

import { useEffect, useState } from 'react'
import { Home, Search as SearchIcon } from 'lucide-react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { LocationSearch } from '../layout/LocationSearch' // Componente de Zona
import { ComboBox } from '../ui/ComboBox' // Componente estético
import TransactionModeFilter from './TransactionModeFilter'
import { usePathname, useRouter } from 'next/navigation'

interface FilterBarProps {
  // Ajustamos los nombres para que coincidan con 'nuevosFiltros'
  onSearch?: (filtros: { 
    tipoInmueble: string[]; 
    modoInmueble: string[]; 
    query: string; 
    updatedAt: string; 
  }) => void;
  variant?: 'home' | 'map';
}

export default function FilterBar({ onSearch, variant = 'home' }: FilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMapPage = pathname?.includes('busqueda_mapa');

  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  // Sincronizar con filtros previos si existen en la sesión
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

  const handleSearch = () => {
    if (modosSeleccionados.length === 0) {
      alert('Por favor, selecciona al menos un modo (Venta, Alquiler o Anticrético)')
      return
    }

    const nuevosFiltros = {
      tipoInmueble: [tipoInmueble.toUpperCase()],
      modoInmueble: modosSeleccionados,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString()
    };

    updateFilters(nuevosFiltros);
    const params = new URLSearchParams();

    modosSeleccionados.forEach(modo => params.append('modoInmueble', modo));
    if (tipoInmueble !== 'Cualquier tipo') {
      params.set('tipoInmueble', tipoInmueble.toUpperCase());
    }
    if (ubicacionTexto.trim() !== '') {
      params.set('query', ubicacionTexto);
    }

    const searchString = params.toString();
    const targetPath = `/busqueda_mapa${searchString ? `?${searchString}` : ''}`;

    router.push(targetPath, { scroll: false });

    if (onSearch) onSearch(nuevosFiltros);
  };

  // Estilos condicionales según la variante
  const containerStyles = variant === 'map' 
    ? "bg-white border-b border-stone-200 p-3 flex flex-row items-center gap-4 w-full shadow-sm" // Diseño compacto para el mapa
    : "bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px]"; // Diseño original del Home
  return (
    <div className={containerStyles}>
      {/* En el mapa ocultamos o achicamos el selector de modo para ganar espacio */}
      <div className={variant === 'map' ? "shrink-0 scale-90 origin-left" : ""}>
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      <div className={`flex items-end gap-3 ${variant === 'map' ? 'flex-1 flex-row' : 'flex-col md:flex-row w-full'}`}>
        <div className={variant === 'map' ? "w-48" : "w-full md:w-1/4"}>
          <ComboBox
            label={variant === 'map' ? "" : "Tipo"}
            placeholder="Cualquier tipo"
            icon={Home}
            options={['Casa', 'Departamento', 'Terreno', 'Espacios Cementerio']}
            onChange={(val) => setTipoInmueble(val)}
          />
        </div>

        <div className="flex-1">
          <LocationSearch value={ubicacionTexto} onChange={setUbicacionTexto} />
        </div>

        <button
          onClick={handleSearch}
          className={`${variant === 'map' ? 'h-[40px] px-6' : 'h-[46px] px-10'} bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95`}
        >
          <SearchIcon size={18} /> {variant === 'map' ? "" : "BUSCAR"}
        </button>
      </div>
    </div>
  )
}