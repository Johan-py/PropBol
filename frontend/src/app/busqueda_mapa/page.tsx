'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, DollarSign, Home, Building, Square, ChevronLeft, Grid, List } from 'lucide-react'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    // CONTENEDOR PADRE: H-screen para que no haya scroll en toda la web
    <div className="flex flex-col h-screen bg-stone-100 overflow-hidden">
      
      {/* BARRA SUPERIOR Y FILTROS (Tu código del merge, pero limpio) */}
      <header className="bg-white border-b border-stone-200 shrink-0 z-20 shadow-sm">
        {/* Tipos de contrato */}
        <div className="flex items-center justify-center gap-8 p-2 text-sm border-b border-stone-100">
          <label className="flex items-center gap-2 cursor-pointer text-[#ea580c] font-bold">
            <div className="w-4 h-4 bg-[#ea580c] rounded-sm"></div> Venta
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-stone-500">
            <div className="w-4 h-4 border border-stone-300 rounded-sm"></div> Alquiler
          </label>
        </div>

        {/* Filtros Principales */}
        <div className="p-3 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-stone-300 rounded-md text-sm"><Building className="w-4 h-4"/> Casas</button>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-stone-300 rounded-md flex-grow max-w-xs bg-stone-50">
            <Search className="w-4 h-4 text-stone-400" />
            <input type="text" placeholder="Buscar..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-stone-300 rounded-md text-sm"><MapPin className="w-4 h-4"/> Zona</button>
          <button className="px-5 py-1.5 bg-[#ea580c] text-white font-bold text-sm rounded-md shadow-md">Más Filtros</button>
        </div>
      </header>

      {/* CUERPO DE LA PÁGINA */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* PANEL LATERAL (Tu Tarea: Día 1 y 2) */}
        <aside 
          className={`
            bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300
            ${isSidebarOpen ? 'w-[450px]' : 'w-0'} // Criterio 1: Ancho fijo
          `}
        >
          {isSidebarOpen && (
            <>
              {/* Cabecera del Panel (Tarea Dev 2) */}
              <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50 shrink-0">
                <div>
                  <button onClick={() => setIsSidebarOpen(false)} className="flex items-center text-xs text-stone-400 hover:text-stone-600 mb-1">
                    <ChevronLeft className="w-4 h-4"/> Ocultar
                  </button>
                  <h2 className="font-bold text-stone-800">Inmuebles en Cocha</h2>
                </div>
                <div className="flex border rounded overflow-hidden">
                  <button className="p-1.5 bg-stone-200"><Grid className="w-4 h-4"/></button>
                  <button className="p-1.5"><List className="w-4 h-4"/></button>
                </div>
              </div>

              {/* ÁREA DE SCROLL INDEPENDIENTE (Tu Tarea: Día 2 - Criterio 9) */}
              <div className="flex-1 overflow-y-auto p-4 bg-stone-100 space-y-4 no-scrollbar">
                {/* Simulando tarjetas para probar el scroll */}
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-40 bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                    <div className="w-full h-24 bg-stone-200 rounded mb-2"></div>
                    <div className="h-4 bg-stone-200 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* ÁREA DEL MAPA */}
        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white border border-stone-300 p-2 rounded-r-md shadow-md"
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