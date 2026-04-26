'use client'
import { useState } from 'react'
import FilterBar from '@/components/filters/FilterBar'

// Definimos exactamente lo que el FilterBar envía para que TS no llore
interface FiltrosInput {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  updatedAt?: string
}
export default function FiltersPage() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (filtros: FiltrosInput) => {
    setIsLoading(true)
    setError('')
    setSearchMessage('')
    setHasSearched(true)

    const params = new URLSearchParams()
    filtros.tipoInmueble?.forEach((t) => params.append('categoria', t))
    filtros.modoInmueble?.forEach((m) => params.append('tipoAccion', m))
    if (filtros.query) params.append('query', filtros.query)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

    try {
      const response = await fetch(`${API_URL}/api/properties/search?${params.toString()}`)
      const data = await response.json()
      const items = Array.isArray(data?.data) ? data.data : []
      setResults(items)
      setSearchMessage(items.length === 0 ? 'Sin resultados' : `Se encontraron ${items.length} resultados.`)
      console.log('Resultados:', data)
      return data
    } catch (error) {
      console.error('Error:', error)
      setError('No fue posible completar la búsqueda. Intenta nuevamente.')
      setResults([])
      return { data: [] }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center pt-32 px-4">
      <FilterBar onSearch={handleSearch} preventNavigation />
      <div className="w-full max-w-4xl mt-6">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-stone-600">Buscando propiedades...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : searchMessage ? (
            <p className="text-sm text-stone-700">{searchMessage}</p>
          ) : hasSearched ? (
            <p className="text-sm text-stone-700">Se encontraron {results.length} resultados.</p>
          ) : (
            <p className="text-sm text-stone-600">Usa los filtros para buscar propiedades.</p>
          )}
        </div>
      </div>
    </div>
  )
}
