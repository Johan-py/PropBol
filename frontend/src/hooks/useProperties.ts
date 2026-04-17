import { useState, useEffect } from 'react'
import { PropertyMapPin } from '@/types/property'
import { useSearchParams } from 'next/navigation'

// Asegurarse de que NEXT_PUBLIC_API_URL esté en .env.local

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

interface UsePropertiesResult {
  properties: PropertyMapPin[]
  isLoading: boolean
  error: string | null
}

export function useProperties(): UsePropertiesResult {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<PropertyMapPin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProperties() {
      setIsLoading(true)
      setError(null)

      try {
        //Convertimos los parámetros de la URL en una query string
        const queryString = searchParams.toString()

        //Llamamos al endpoint de inmuebles con los filtros dinámicos
        const res = await fetch(`${API_URL}/api/properties/inmuebles?${queryString}`)

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()

        // Actualizamos el estado con los datos reales de la BD.
        // Soportamos llaves legacy (snake_case) y actuales (camelCase).
        if (!cancelled) {
          const mappedData: PropertyMapPin[] = (json.data || [])
  .filter((item: any) => {
    const lat = Number(item.ubicacion_inmueble?.latitud)
    const lng = Number(item.ubicacion_inmueble?.longitud)

    return (
      item.ubicacion_inmueble &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0
    )
  })
  .map((item: any) => ({
    id: item.id.toString(),
    lat: Number(item.ubicacion_inmueble.latitud),
    lng: Number(item.ubicacion_inmueble.longitud),
    price: Number(item.precio),
    currency: "USD",
    type: (item.categoria?.toLowerCase().trim() || "casa") as any,
    title: item.titulo,
    descripcion: item.descripcion ?? null,
    nroCuartos: item.nroCuartos ?? null,
    nroBanos: item.nroBanos ?? null,
    superficieM2: item.superficieM2 ? Number(item.superficieM2) : null,
    thumbnailUrl:
      item.publicacion?.[0]?.multimedia?.[0]?.url ?? undefined,
  }))
          setProperties(mappedData);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Error al conectar con PropBol')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProperties()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  return { properties, isLoading, error }
}
