'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft } from 'lucide-react'
import FilterBar from '@/components/FilterBar'

import HeaderPanel from '@/components/galeria/HeaderPanel'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  // Nuestra lista inicia vacía para probar el estado "Sin resultados"
  const [data, setData] = useState<any[]>([])

  return (
    <div className="flex flex-col h-screen bg-stone-100 overflow-hidden">

      {/* Filtros */}
      <FilterBar />

      <main className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR */}
        <aside 
          className={`
            bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300
            ${isSidebarOpen ? 'w-[450px]' : 'w-0'}
          `}
        >
          {isSidebarOpen && (
            <>
              {/* Barra superior solo Ocultar */}
              <div className="p-4 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center text-xs text-stone-400 hover:text-stone-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-1"/> Ocultar
                </button>
              </div>

              {/* Título + botones vista + cantidad */}
              <div className="px-4 py-4 border-b border-stone-200 bg-white shrink-0 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Lista de Inmuebles</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.length} encontrado{data.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Ahora HeaderPanel solo tiene los botones */}
                <HeaderPanel />
              </div>

              {/* Contenido scroll */}
              <div className="flex-1 overflow-y-auto p-4 bg-white no-scrollbar">
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">

                  {/* Header tabla */}
                  <div className="grid grid-cols-[40px_70px_minmax(0,1fr)_50px] gap-2 bg-gray-50/70 px-3 py-2 border-b items-center">
                    <span className="text-[9px] font-bold text-gray-500">Foto</span>
                    <span className="text-[9px] font-bold text-gray-500">Precio</span>
                    <span className="text-[9px] font-bold text-gray-500">Detalle / m²</span>
                    <span className="text-[9px] font-bold text-gray-500 text-center">Contacto</span>
                  </div>

                  {/* Filas o Estado Vacío */}
                  <div className="divide-y divide-gray-50 flex-1 flex flex-col min-h-[300px]">
                    {data.length > 0 ? (
                      data.map((item, index) => (
                        <PropertyRow
                          key={index}
                          title={item.title}
                          price={item.price}
                          size={item.size}
                          contactType={item.contactType}
                          image={item.image}
                        />
                      ))
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* MAPA */}
        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white border border-stone-300 p-2 rounded-r-md shadow-md hover:bg-stone-50"
            >
              →
            </button>
          )}

          <div className="absolute inset-0">
            <MapView />
          </div>
        </section>

      </main>
    </div>
  )
}