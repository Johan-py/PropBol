"use client";

import React, { useState } from 'react';
import { Trash2 } from "lucide-react";

export default function MisComparacionesPage() {
    const [filtro, setFiltro] = useState('Departamentos');
    const categorias = ['Ver Todas', 'Casas', 'Departamentos', 'Terrenos'];

    return (
        <main className="min-h-screen bg-white p-4 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* TITULO Y SUBTITULO - Ajustado centrado en móvil */}
                <header className="mb-8 text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Historial de Comparaciones</h1>
                    <p className="text-gray-600 text-base md:text-lg">Revisa y retorna tus análisis previos de propiedades.</p>
                </header>

                {/* FILTROS - Con scroll horizontal en móvil si no caben */}
                <div className="flex gap-2 md:gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFiltro(cat)}
                            className={`px-4 md:px-6 py-2 rounded-xl border-2 text-sm md:text-lg font-medium transition-all whitespace-nowrap ${
                                filtro === cat
                                    ? 'bg-[#E87B00] text-white border-[#E87B00]'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* CONTENEDORES DE COMPARACIÓN - 1 columna en móvil, 2 en desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                    {/* BLOQUE DE DEPARTAMENTOS */}
                    <section className="bg-[#F0F4FF] rounded-3xl border border-[#DCE4FF] p-5 md:p-8 flex flex-col">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 px-2 text-center md:text-left">
                            Comparación de Departamentos (7 de Mayo, 2026)
                        </h2>

                        {/* Subgrid: 1 col en móvil, 3 en desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50">
                                    <div className="h-40 md:h-28 bg-gray-200">
                                        <img src={`https://via.placeholder.com/300x200?text=Dep${i}`} alt="Property" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 md:p-3 text-[13px] leading-tight">
                                        <p className="font-bold text-black mb-2 text-[15px] md:text-[14px]">Departamento {i}</p>
                                        <p className="text-black mb-1"><strong>Ubicación:</strong> Sopocachi</p>
                                        <p className="text-black mb-1"><strong>Precios:</strong> $120k - $160k</p>
                                        <p className="text-black"><strong>Superficie:</strong> 85m²</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-auto mx-auto flex items-center gap-2 px-6 md:px-8 py-3 md:py-2 bg-white border border-[#F3C291] text-[#E87B00] rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm text-sm">
                            <Trash2 size={18} /> Eliminar comparación
                        </button>
                    </section>

                    {/* BLOQUE DE CASAS */}
                    <section className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8 flex flex-col shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 px-2 text-center md:text-left">
                            Comparación de Casas (7 de Mayo, 2026)
                        </h2>

                        {/* Subgrid: 1 col en móvil, 2 en desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50">
                                    <div className="h-44 md:h-32 bg-gray-200">
                                        <img src={`https://via.placeholder.com/400x300?text=Casa${i}`} alt="Property" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-5 md:p-4 text-[14px] leading-tight">
                                        <p className="font-bold text-black mb-2 text-[17px] md:text-[16px]">Casa {i}</p>
                                        <p className="text-black mb-1"><strong>Ubicación:</strong> Zona Sur</p>
                                        <p className="text-black mb-1"><strong>Precios:</strong> $210k - $280k</p>
                                        <p className="text-black"><strong>Superficie:</strong> 180m² - 230m²</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-auto mx-auto flex items-center gap-2 px-6 md:px-8 py-3 md:py-2 bg-white border border-[#F3C291] text-[#E87B00] rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm text-sm">
                            <Trash2 size={18} /> Eliminar comparación
                        </button>
                    </section>

                </div>
            </div>
        </main>
    );
}