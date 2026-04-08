'use client'

import dynamic from 'next/dynamic'
import { usePropertiesMap } from './usePropertiesMap'
import { useState } from 'react'
import PropertyList from './PropertyList'
import Filters from './Filters'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false
})

export default function Page() {
  const { properties, loading } = usePropertiesMap()

  const [filters, setFilters] = useState({})
  const [selectedProperty, setSelectedProperty] = useState(null)

  if (loading) return <p>Cargando...</p>

  // 🔥 FILTRO EN TIEMPO REAL
  const filtered = properties.filter((p) => {
    if (filters.tipo && p.tipo !== filters.tipo) return false

    if (filters.categoria && p.categoria !== filters.categoria) return false

    if (filters.precio === 'bajo' && p.precio > 50000) return false
    if (filters.precio === 'alto' && p.precio < 50000) return false

    return true
  })

  return (
    <div style={{ display: 'flex' }}>
      
      {/* 🧾 LISTA */}
      <div>
        <Filters setFilters={setFilters} />
        <PropertyList
          properties={filtered}
          onSelect={setSelectedProperty}
          selectedProperty={selectedProperty}
        />
      </div>

      {/* 🗺️ MAPA */}
      <div style={{ flex: 1 }}>
        <MapView
          properties={filtered}
          selectedProperty={selectedProperty}
          onSelect={setSelectedProperty}
        />
      </div>

    </div>
  )
}