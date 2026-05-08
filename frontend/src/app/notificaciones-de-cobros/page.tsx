'use client'
import React from 'react'
import { ExternalLink, History } from 'lucide-react'

export default function NotificacionesPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 italic">
          Notificaciones — <span className="text-orange-500">PropBol</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Notificaciones (Vacío por ahora) */}
        <section className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
           <div className="p-6 border-b border-slate-50 font-bold">Mis Notificaciones</div>
        </section>

        {/* Detalle del Plan (Estructura base) */}
        <section className="lg:col-span-7 bg-white rounded-3xl shadow-2xl border-2 border-green-400 p-10 flex flex-col items-center">
           <div className="text-6xl mb-6">🏠</div>
           <h2 className="text-3xl font-black text-slate-800 mb-2">Plan Estándar</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              <button className="bg-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                Ver mi Plan <ExternalLink size={20} />
              </button>
              <button className="border-2 border-slate-100 text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                Ver Historial <History size={20} />
              </button>
           </div>
        </section>
      </div>
    </div>
  )
}