'use client'
import FilterBar from '@/components/filters/FilterBar'

export default function FiltersPage() {
  // Usamos 'any' para que TypeScript ignore la diferencia de nombres entre versiones
  const handleSearch = async (filtros: any) => {
    const params = new URLSearchParams()
    
    // Mapeo seguro: si existen los nuevos nombres, úsalos; si no, usa los viejos
    const tipos = filtros.tipoInmueble || filtros.tipos || []
    const modos = filtros.modoInmueble || filtros.modo || []
    const busqueda = filtros.query || ""

    tipos.forEach((t: string) => params.append('categoria', t))
    modos.forEach((m: string) => params.append('tipoAccion', m))
    if (busqueda) params.append('query', busqueda)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    try {
      const response = await fetch(`${API_URL}/api/properties/search?${params.toString()}`)
      const data = await response.json()
      console.log('Resultados de búsqueda:', data)
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    }
  }

  return (
    <div className="flex flex-col items-center pt-32 px-4">
      {/* El error en la línea 18 desaparece porque handleSearch ahora acepta 'any' */}
      <FilterBar onSearch={handleSearch} />
    </div>
  )
}