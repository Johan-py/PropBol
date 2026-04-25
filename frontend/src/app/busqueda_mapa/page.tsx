'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'

import FilterBar from '@/components/filters/FilterBar'
import PriceFilterSidebar from '@/components/filters/PriceFilterSidebar'
import SuperficieFilterSidebar from '@/components/filters/SuperficieFilterSidebar'
import { CapacidadSidebar } from '@/components/filters/CapacidadSidebar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'

import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
import { PropertyMapPin } from '@/types/property'

// =========================
// ✅ TIPADO (sin any)
// =========================

// MAPA (CSR)
const MapView = dynamic(() => import('./MapView'), { ssr: false })

function BusquedaMapaContent() {
    const router = useRouter()

    // =========================
    // UI STATE
    // =========================
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const [activeSidebarView, setActiveSidebarView] = useState<
        'results' | 'price' | 'superficie' | 'capacidad'
    >('results')

    const [viewMode] = useState<'grid' | 'list'>('grid')

    // =========================
    // DATA
    // =========================
    const { properties, isLoading } = useProperties()

    const { ordenActual, cambiarOrden, inmueblesOrdenados } =
        useOrdenamiento({
            inmuebles: properties ?? []
        })

    const propiedades: PropertyMapPin[] = inmueblesOrdenados
    // =========================
    // HANDLER FILTERBAR
    // =========================
    const handleSearch = (filtros: {
        query: string
        modoInmueble: string[]
        amenidades: string[]
        etiquetas: string[]
        tipoInmueble?: string[]
    }) => {
        const params = new URLSearchParams()

        if (filtros.query) params.set('query', filtros.query)
        if (filtros.modoInmueble.length)
            params.set('modoInmueble', filtros.modoInmueble.join(','))
        if (filtros.amenidades.length)
            params.set('amenidades', filtros.amenidades.join(','))
        if (filtros.etiquetas.length)
            params.set('etiquetas', filtros.etiquetas.join(','))

        router.push(`?${params.toString()}`)
    }

    // =========================
    // RENDER
    // =========================
    return (
        <div className="flex flex-col bg-white w-full h-[calc(100dvh-54px)] overflow-hidden">

            {/* FILTER BAR */}
            <FilterBar onSearch={handleSearch} />

            <main className="flex flex-row flex-1 min-h-0">

                {/* SIDEBAR */}
                <aside
                    className={`bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-[450px]' : 'w-0'
                        }`}
                >
                    {activeSidebarView === 'price' && (
                        <PriceFilterSidebar
                            isOpen
                            onClose={() => setActiveSidebarView('results')}
                            totalResultados={propiedades.length}
                        />
                    )}

                    {activeSidebarView === 'superficie' && (
                        <SuperficieFilterSidebar
                            onClose={() => setActiveSidebarView('results')}
                        />
                    )}

                    {activeSidebarView === 'capacidad' && (
                        <CapacidadSidebar
                            isOpen
                            onClose={() => setActiveSidebarView('results')}
                            onApply={() => setActiveSidebarView('results')}
                        />
                    )}

                    {activeSidebarView === 'results' && (
                        <div className="flex flex-col h-full">

                            {/* HEADER */}
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
                                totalResultados={propiedades.length}
                                ordenActual={ordenActual}
                                onOrdenChange={cambiarOrden}
                            />

                            {/* LISTA */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <p>Cargando...</p>
                                ) : propiedades.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {propiedades.map((p) => (
                                            <div key={p.id}>
                                                {viewMode === 'grid' ? (
                                                    <PropertyCard
                                                        imagen=""
                                                        estado={p.type}
                                                        precio={String(p.price)}
                                                        descripcion={p.title}
                                                        camas={p.nroCuartos ?? 0}
                                                        banos={p.nroBanos ?? 0}
                                                        metros={p.superficieM2 ?? 0}
                                                    />
                                                ) : (
                                                    <PropertyRow
                                                        title={p.title}
                                                        price={String(p.price)}
                                                        size={`${p.superficieM2 ?? 0} m²`}
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

                {/* MAPA */}
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
                        properties={propiedades}
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