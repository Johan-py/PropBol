'use client'

import { CapacidadSidebar } from '@/components/filters/CapacidadSidebar'
import { useState, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

// === HOOKS ===
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'

// === COMPONENTES ===
import FilterBar from '@/components/filters/FilterBar'
import PriceFilterSidebar from '@/components/filters/PriceFilterSidebar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'
import SuperficieFilterSidebar from '@/components/filters/SuperficieFilterSidebar'

// MAPA
const MapView = nextDynamic(() => import('./MapView'), { ssr: false })

function BusquedaMapaContent() {

  const router = useRouter()
  const searchParams = useSearchParams()

  // =========================
  // FILTROS DESDE URL (HU6)
  // =========================
  const filtrosActivos = useMemo(() => ({
    query: searchParams.get('query') || '',
    amenidades: searchParams.get('amenidades')?.split(',') || [],
    etiquetas: searchParams.get('etiquetas')?.split(',') || []
  }), [searchParams])

  // =========================
  // ESTADOS UI
  // =========================
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [activeSidebarView, setActiveSidebarView] = useState<
    'results' | 'price' | 'superficie' | 'capacidad'
  >('results')

  // =========================
  // DATA
  // =========================

  const { properties, isLoading } = useProperties()
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: properties || []
  })

  const [viewMode] = useState<'grid' | 'list'>('grid')

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-col bg-white w-full h-[calc(100dvh-54px)] overflow-hidden">

      {/* ================= FILTER BAR ================= */}
      <FilterBar
        onSearch={(filtros) => {
          const params = new URLSearchParams()

          if (filtros.query) {
            params.set('query', filtros.query)
          }

          if (filtros.amenidades.length > 0) {
            params.set('amenidades', filtros.amenidades.join(','))
          }

          if (filtros.etiquetas.length > 0) {
            params.set('etiquetas', filtros.etiquetas.join(','))
          }

          router.push(`?${params.toString()}`)
        }}
      />

      {/* ================= MAIN ================= */}
      <main className="flex flex-row flex-1 min-h-0">

        {/* ================= SIDEBAR ================= */}
        <aside className={`bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-[450px]' : 'w-0'}`}>

          {/* ================= PRICE ================= */}
          {activeSidebarView === 'price' && (
            <PriceFilterSidebar
              isOpen={true}
              onClose={() => setActiveSidebarView('results')}
              totalResultados={inmueblesOrdenados.length}
            />
          )}

          {/* ================= SUPERFICIE ================= */}
          {activeSidebarView === 'superficie' && (
            <SuperficieFilterSidebar
              onClose={() => setActiveSidebarView('results')}
            />
          )}

          {/* ================= CAPACIDAD ================= */}
          {activeSidebarView === 'capacidad' && (
            <CapacidadSidebar
              isOpen={true}
              onClose={() => setActiveSidebarView('results')}
              onApply={() => setActiveSidebarView('results')}
            />
          )}

          {/* ================= RESULTADOS ================= */}
          {activeSidebarView === 'results' && (
            <div className="flex flex-col h-full">

              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Filter className="text-orange-500 w-4 h-4" />
                  <h2 className="font-semibold">Resultados</h2>
                </div>

                <button onClick={() => setIsSidebarOpen(false)}>
                  <ChevronLeft />
                </button>
              </div>

              <MenuOrdenamiento
                totalResultados={inmueblesOrdenados.length}
                ordenActual={ordenActual}
                onOrdenChange={cambiarOrden}
              />

              <div className="flex-1 overflow-y-auto p-4">

                {isLoading ? (
                  <p>Cargando...</p>
                ) : inmueblesOrdenados.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col gap-3">
                    {inmueblesOrdenados.map((p: any) => (
                      <div key={p.id}>
                        {viewMode === 'grid' ? (
                          <PropertyCard
                            imagen=""
                            estado={p.type}
                            precio={p.price}
                            descripcion={p.title}
                            camas={p.nroCuartos}
                            banos={p.nroBanos}
                            metros={p.superficieM2}
                          />
                        ) : (
                          <PropertyRow
                            title={p.title}
                            price={p.price}
                            size=""
                            contactType="whatsapp"
                            image=""
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          )}

        </aside>

        {/* ================= MAP ================= */}
        <section className="flex-1 relative">

          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-10 bg-white shadow px-2 py-4"
            >
              <ChevronRight />
            </button>
          )}

          <MapView
            properties={inmueblesOrdenados}
            selectedId={null}
            onSelect={() => { }}
            isLoading={isLoading}
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