'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'

import FilterBar from '@/components/filters/FilterBar'
import PriceFilterSidebar from '@/components/filters/PriceFilterSidebar'
import SuperficieFilterSidebar from '@/components/filters/SuperficieFilterSidebar'
import { CapacidadSidebar } from '@/components/filters/CapacidadSidebar'
import { UbicacionEspecificaPanel } from '@/components/filters/UbicacionEspecificaPanel'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
import type { PropertyMapPin } from '@/types/property'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

type SidebarView = 'results' | 'price' | 'superficie' | 'capacidad' | 'ubicacion'
type ViewMode = 'grid' | 'list'

function formatPrice(property: PropertyMapPin) {
  return property.currency === 'USD'
    ? `$${property.price.toLocaleString('es-BO')} USD`
    : `Bs ${property.price.toLocaleString('es-BO')}`
}

function getPropertyImage(property: PropertyMapPin) {
  return (
    property.thumbnailUrl ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
  )
}

function BusquedaMapaContent() {
  const router = useRouter()
  const { properties, isLoading, error } = useProperties()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSidebarView, setActiveSidebarView] = useState<SidebarView>('results')
  const [viewMode] = useState<ViewMode>('grid')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: properties ?? []
  })

  const propiedades: PropertyMapPin[] = inmueblesOrdenados

  useEffect(() => {
    const handleAbrirUbicacion = () => {
      setIsSidebarOpen(true)
      setActiveSidebarView('ubicacion')
    }

    window.addEventListener('abrirPanelUbicacion', handleAbrirUbicacion)
    return () => window.removeEventListener('abrirPanelUbicacion', handleAbrirUbicacion)
  }, [])

  const handleSearch = (filtros: {
    query: string
    modoInmueble: string[]
    amenidades: string[]
    etiquetas: string[]
    tipoInmueble?: string[]
  }) => {
    const params = new URLSearchParams()

    if (filtros.query) params.set('query', filtros.query)
    if (filtros.modoInmueble.length) {
      params.set('modoInmueble', filtros.modoInmueble.join(','))
    }
    if (filtros.amenidades.length) {
      params.set('amenidades', filtros.amenidades.join(','))
    }
    if (filtros.etiquetas.length) {
      params.set('etiquetas', filtros.etiquetas.join(','))
    }
    if (filtros.tipoInmueble?.length) {
      params.set('tipoInmueble', filtros.tipoInmueble.join(','))
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const closeToResults = () => setActiveSidebarView('results')

  return (
    <div className="flex flex-col bg-white w-full h-[calc(100dvh-54px)] overflow-hidden">
      <FilterBar
        variant="map"
        onSearch={handleSearch}
        onOpenPriceFilter={() => {
          setIsSidebarOpen(true)
          setActiveSidebarView((prev) => (prev === 'price' ? 'results' : 'price'))
        }}
        onOpenSuperficieFilter={() => {
          setIsSidebarOpen(true)
          setActiveSidebarView((prev) => (prev === 'superficie' ? 'results' : 'superficie'))
        }}
        onToggleCapacidad={() => {
          setIsSidebarOpen(true)
          setActiveSidebarView((prev) => (prev === 'capacidad' ? 'results' : 'capacidad'))
        }}
        isPriceFilterActive={activeSidebarView === 'price'}
        isSuperficieFilterActive={activeSidebarView === 'superficie'}
        isCapacidadActive={activeSidebarView === 'capacidad'}
      />

      <main className="flex flex-row flex-1 min-h-0">
        <aside
          className={`bg-white border-r transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? 'w-[450px]' : 'w-0'
          }`}
        >
          {activeSidebarView === 'price' && (
            <PriceFilterSidebar
              isOpen
              onClose={closeToResults}
              totalResultados={propiedades.length}
            />
          )}

          {activeSidebarView === 'superficie' && (
            <SuperficieFilterSidebar onClose={closeToResults} />
          )}

          {activeSidebarView === 'capacidad' && (
            <CapacidadSidebar
              isOpen
              onClose={closeToResults}
              onApply={(dormitoriosMin, dormitoriosMax, banosMin, banosMax, tipoBano) => {
                const params = new URLSearchParams(window.location.search)
                params.set('dormitoriosMin', dormitoriosMin.toString())
                params.set('dormitoriosMax', dormitoriosMax.toString())
                params.set('banosMin', banosMin.toString())
                params.set('banosMax', banosMax.toString())
                params.set('tipoBano', tipoBano)
                router.push(`/busqueda_mapa?${params.toString()}`, { scroll: false })
                closeToResults()
              }}
            />
          )}

          {activeSidebarView === 'ubicacion' && (
            <div className="flex flex-col h-full">
              <UbicacionEspecificaPanel onClose={closeToResults} />
            </div>
          )}

          {activeSidebarView === 'results' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Filter className="text-orange-500 w-4 h-4" />
                  <h2 className="font-semibold">Resultados</h2>
                </div>

                <button type="button" onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft />
                </button>
              </div>

              <MenuOrdenamiento
                totalResultados={propiedades.length}
                ordenActual={ordenActual}
                onOrdenChange={cambiarOrden}
              />

              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <p>Cargando...</p>
                ) : error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : propiedades.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col gap-3">
                    {propiedades.map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => setSelectedPropertyId(property.id)}
                        className="text-left"
                      >
                        {viewMode === 'grid' ? (
                          <PropertyCard
                            imagen={getPropertyImage(property)}
                            estado={property.type}
                            precio={formatPrice(property)}
                            descripcion={property.descripcion || property.title}
                            camas={property.nroCuartos ?? 0}
                            banos={property.nroBanos ?? 0}
                            metros={property.superficieM2 ?? 0}
                          />
                        ) : (
                          <PropertyRow
                            title={property.title}
                            price={formatPrice(property)}
                            size={`${property.superficieM2 ?? 0} m2`}
                            contactType="whatsapp"
                            image={getPropertyImage(property)}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1 relative">
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-10 bg-white shadow px-2 py-4"
            >
              <ChevronRight />
            </button>
          )}

          <MapView
            properties={propiedades}
            selectedId={selectedPropertyId}
            onSelect={setSelectedPropertyId}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </main>
    </div>
  )
}

export default function BusquedaMapaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BusquedaMapaContent />
    </Suspense>
  )
}
