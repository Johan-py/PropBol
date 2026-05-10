'use client'
import React from 'react'
import { ExternalLink, History, CheckCircle2, AlertCircle } from 'lucide-react'
const NOTIFICACIONES_MOCK = [
  { 
    id: 1, 
    tipo: 'aprobado', 
    titulo: '¡Tu pago fue aprobado!', 
    desc: 'Plan Estándar activado correctamente.', 
    tiempo: 'hace 3 min', 
    icon: <CheckCircle2 className="text-green-500" size={20} /> 
  },
  { 
    id: 2, 
    tipo: 'rechazado', 
    titulo: 'Pago rechazado', 
    desc: 'El monto no coincide con el plan seleccionado.', 
    tiempo: 'hace 1h', 
    icon: <AlertCircle className="text-red-500" size={20} /> 
  }
];
export default function NotificacionesPage() {
  return (
   <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10 font-sans">
      {/* Header - Parte 1 */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 italic">
          Notificaciones — <span className="text-orange-500">PropBol</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panel Notificaciones - Parte 2 (Dinámico) */}
        <section className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 font-bold text-slate-700">
            Mis Notificaciones
          </div>
          
          <div className="divide-y divide-slate-50">
            {NOTIFICACIONES_MOCK.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex gap-4 relative hover:bg-slate-50 transition-colors cursor-pointer ${
                  notif.tipo === 'aprobado' ? 'bg-orange-50/30' : ''
                }`}
              >
                {/* Indicador lateral para aprobados */}
                {notif.tipo === 'aprobado' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                )}
                
                {/* Icono contenedor */}
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                  {notif.icon}
                </div>

                {/* Texto de la notificación */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-sm">{notif.titulo}</h3>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {notif.tiempo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {notif.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
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