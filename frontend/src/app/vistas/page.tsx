import React from 'react';
import { MOCK_PROPERTIES } from '@/data/mockProperties';


export default function VistasRecientesPage() {
    const displayedProperties = MOCK_PROPERTIES.slice(0, 8).map((prop, index) => ({
        ...prop,
        fechaVista: index === 0 ? "Hoy" : index < 3 ? "Ayer" : `1${index}/04/2026`
    }));
    return (
        <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header con botones de acción */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Propiedades vistas recientemente</h1>
                        <p className="text-gray-500 text-xs">{MOCK_PROPERTIES.length} propiedades encontradas</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition-all">
                            Filtrar por Fecha
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                            Limpiar Historial
                        </button>
                    </div>
                </div>

                {/* Grid de Propiedades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayedProperties.map((prop: any) => (
                        <div key={prop.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative hover:shadow-md transition-all">

                            {/* Contenedor de Imagen */}
                            <div className="relative h-44 w-full bg-gray-200">
                                <img
                                    src={prop.image || 'https://via.placeholder.com/400x300'}
                                    alt={prop.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Contenido de la Tarjeta */}
                            <div className="p-4 relative">
                                {/* Badge de Fecha y Referencia */}
                                <div className="absolute top-4 right-4 text-right flex flex-col items-end">
                                    <div className="bg-[#4B4B4B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm mb-1">
                                        Visto: {prop.fechaVista}
                                    </div>
                                    <span className="text-[9px] text-gray-300 font-medium">Ref: #{prop.id || 'prop-001'}</span>
                                </div>

                                {/* Precio */}
                                <p className="text-[#E87B00] font-bold text-lg">${prop.price || '150,000'} USD</p>

                                {/* Título en Negro */}
                                <h3 className="font-bold text-black text-sm mt-1 truncate">{prop.title}</h3>

                                {/* Ubicación (Sin icono) */}
                                <p className="text-black text-[11px] mt-1 font-medium italic">Cochabamba, Bolivia</p>

                                {/* Detalles técnicos */}
                                <div className="flex items-center gap-2 mt-3 text-[10px] text-black font-medium italic">
                                    <span>3 hab</span>
                                    <span>•</span>
                                    <span>2 baños</span>
                                    <span>•</span>
                                    <span>1 garaje</span>
                                </div>

                                {/* Botón Ver Detalle (Texto Negro y ocupa todo el ancho) */}
                                <div className="mt-4">
                                    <button className="w-full bg-[#E87B00] text-black py-2.5 rounded-lg text-xs font-bold hover:bg-orange-600 shadow-sm transition-colors text-center">
                                        Ver Detalle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/*Paginación*/}
                <div className="mt-10 flex justify-center items-center gap-1.5 pb-10">
                    <button className="w-9 h-9 flex items-center justify-center bg-[#E87B00] text-white rounded-md shadow-sm text-sm font-bold">1</button>
                    {[2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                        <button key={n} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-all">
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}