'use client'

import { useState, useEffect } from 'react'
import { PropertyMapPin } from '@/types/property'
import { useSearchParams } from 'next/navigation'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

interface UsePropertiesResult {
  properties: PropertyMapPin[]
  isLoading: boolean
  error: string | null
}

// 👇 Tipo mínimo para evitar "any"
type ApiProperty = {
  id: number
  titulo: string
  descripcion?: string | null
  precio: number
  categoria?: string
  nroCuartos?: number | null
  nroBanos?: number | null
  superficieM2?: number | string | null
  ubicacion?: {
    latitud: number | string
    longitud: number | string
  }
  ubicacion_inmueble?: {
    latitud: number | string
    longitud: number | string
  }
  publicaciones?: any[]
  publicacion?: any[]
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
        const queryString = searchParams.toString()

        const res = await fetch(`${API_URL}/api/properties/inmuebles?${queryString}`)

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

        const json = await res.json()

        if (!cancelled) {
          const mappedData: PropertyMapPin[] = (json.data || [])
            .filter((item: ApiProperty) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble

              const lat = Number(ubicacion?.latitud)
              const lng = Number(ubicacion?.longitud)

              return ubicacion && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
            })
            .map((item: ApiProperty) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble
              const publicaciones = item.publicaciones ?? item.publicacion ?? []

              // 🔥 TIPADO CORRECTO SIN "any"
              const categoria = item.categoria?.toLowerCase().trim()

              const tipoSeguro: PropertyMapPin['type'] =
                categoria === 'casa' ||
                  categoria === 'departamento' ||
                  categoria === 'terreno'
                  ? categoria
                  : 'casa'

              return {
                id: item.id.toString(),
                lat: Number(ubicacion!.latitud),
                lng: Number(ubicacion!.longitud),
                price: Number(item.precio),
                currency: 'USD',
                type: tipoSeguro,
                title: item.titulo,
                descripcion: item.descripcion ?? null,
                nroCuartos: item.nroCuartos ?? null,
                nroBanos: item.nroBanos ?? null,
                superficieM2: item.superficieM2 ? Number(item.superficieM2) : null,
                thumbnailUrl: publicaciones?.[0]?.multimedia?.[0]?.url ?? undefined
              }
            })

          setProperties(mappedData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al conectar con PropBol')
        }
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