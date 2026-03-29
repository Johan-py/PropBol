'use client'
import { useState } from 'react';
import HeaderPropio from "@/components/HeaderPropio";

export default function MiRegistroPage() {
  // Estado para mostrar el mensaje de éxito o error (como en tus mockups)
  const [estado, setEstado] = useState<'ninguno' | 'exito' | 'error'>('ninguno');

  return (
    <div className="min-h-screen bg-white">
      <HeaderPropio />

      <main className="max-w-6xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Registro Inmueble</h1>
        
        {/* Contenedor Beige Principal */}
        <div className="bg-[#FAF4ED] rounded-3xl p-10 shadow-sm border border-gray-100">
           
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-orange-600 text-xl">📋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Registro de Inmueble</h2>
           </div>

           <p className="text-[15px] text-gray-600 mb-10">
             Completa el siguiente formulario con la información detallada del inmueble para su venta o alquiler. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-8">
                 {/* Información Principal */}
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Información Principal</h3>
                    <div className="space-y-5">
                       <div>
                          <label className="block text-sm font-bold mb-2">Título del anuncio <span className="text-red-500">*</span></label>
                          <input className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Tropico 6 Federaciones" />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold mb-2">Tipo de operacion <span className="text-red-500">*</span></label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 bg-white">
                              <option>Anticretico</option>
                              <option>Venta</option>
                              <option>Alquiler</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">Tipo Inmueble <span className="text-red-500">*</span></label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-400">
                              <option>Seleccionar...</option>
                              <option>Casa</option>
                              <option>Departamento</option>
                            </select>
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-bold mb-2">Precio USD$ <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400">$</span>
                            <input type="number" className="w-full p-3 pl-8 rounded-xl border border-gray-200" placeholder="0" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Detalles de la Propiedad */}
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Detalles de la Propiedad</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold mb-2">Area total (m²) <span className="text-red-500">*</span></label>
                          <input className="w-full p-3 rounded-xl border border-gray-200" placeholder="0" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">Habitaciones <span className="text-red-500">*</span></label>
                          <input className="w-full p-3 rounded-xl border border-gray-200" placeholder="0" />
                        </div>
                    </div>
                 </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="flex flex-col justify-between">
                 <div>
                    <label className="block text-sm font-bold mb-2">Descripción detallada <span className="text-red-500">*</span></label>
                    <textarea 
                      className="w-full p-4 rounded-2xl border border-gray-200 h-64 bg-white text-sm" 
                      placeholder="Casa de dos plantas, fachada amarilla, techo de calamina..."
                    ></textarea>
                    <p className="text-red-400 text-xs mt-1 italic">La descripcion es obligatoria</p>
                 </div>

                 {/* BOTONES Y MENSAJES */}
                 <div className="mt-10 space-y-6">
                    <div className="flex justify-end gap-4">
                       <button 
                        onClick={() => setEstado('error')}
                        className="px-8 py-3 rounded-full border-2 border-orange-400 text-gray-700 font-bold hover:bg-orange-50 transition"
                       >
                         Cancelar
                       </button>
                       <button 
                        onClick={() => setEstado('exito')}
                        className="px-8 py-3 rounded-full bg-[#D9D9D9] text-gray-800 font-bold border-2 border-gray-400 hover:bg-gray-300 transition"
                       >
                         Continuar
                       </button>
                    </div>

                    {/* Mensaje de Error (Mockup 1) */}
                    {estado === 'error' && (
                      <div className="flex items-center gap-3 bg-white border-2 border-red-400 rounded-2xl p-4 shadow-sm animate-bounce">
                        <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">X</div>
                        <span className="text-xs font-bold text-gray-600 uppercase">Debe llenar todos los campos obligatoriamente</span>
                      </div>
                    )}

                    {/* Mensaje de Éxito (Mockup 2) */}
                    {estado === 'exito' && (
                      <div className="flex items-center gap-3 bg-white border-2 border-orange-400 rounded-2xl p-4 shadow-sm">
                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">✓</div>
                        <span className="text-sm font-medium text-gray-700 italic">Datos completados correctamente</span>
                      </div>
                    )}
                 </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  );
}