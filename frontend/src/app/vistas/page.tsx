"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Trash2 } from "lucide-react";

const PropertyCard = ({ prop, onVerDetalle }: { prop: any; onVerDetalle: (id: number) => void }) => {
    const fecha = new Date(prop.viewedDate).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit'
    });

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative hover:shadow-md transition-all">
            <div
                className="relative h-44 w-full bg-gray-200 cursor-pointer"
                onClick={() => onVerDetalle(prop.id)}
            >
                <img
                    src={prop.imageUrl || 'https://via.placeholder.com/400x300'}
                    alt={prop.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4 relative">
                <div className="absolute top-4 right-4 text-right flex flex-col items-end">
                    <div className="bg-[#4B4B4B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm mb-1">
                        Visto: {fecha}
                    </div>
                    <span className="text-[9px] text-gray-300 font-medium">Ref: #{prop.id}</span>
                </div>
                <p className="text-[#E87B00] font-bold text-lg">${prop.price?.toLocaleString()} USD</p>
                <h3
                    className="font-bold text-black text-sm mt-1 truncate cursor-pointer hover:text-[#E87B00] transition-colors"
                    onClick={() => onVerDetalle(prop.id)}
                >
                    {prop.title}
                </h3>
                <p className="text-black text-[11px] mt-1 font-medium italic">{prop.location}</p>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-black font-medium italic">
                    <span>3 hab</span><span>•</span><span>2 baños</span><span>•</span><span>1 garaje</span>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => onVerDetalle(prop.id)}
                        className="w-full bg-[#E87B00] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-orange-600 shadow-sm text-center transition-colors"
                    >
                        Ver Detalle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function VistasRecientesPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const fetchHistorial = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perfil/historial/vistas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProperties(data);
            setFilteredProperties(data);
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorial();
    }, []);

    const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (!selectedDate) {
            setFilteredProperties(properties);
            return;
        }
        const filtered = properties.filter(p =>
            new Date(p.viewedDate).toISOString().split('T')[0] === selectedDate
        );
        setFilteredProperties(filtered);
    };

    const handleClearHistory = async () => {
        if (!confirm("¿Deseas borrar todo tu historial de vistas?")) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perfil/historial/vistas`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProperties([]);
            setFilteredProperties([]);
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    };

    const verDetallePropiedad = (id: number) => {
        router.push(`/detalle-propiedad/${id}`);
    };

    if (loading) return <div className="p-20 text-center font-bold text-black">Conectando con PropBol...</div>;

    return (
        <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Propiedades vistas recientemente</h1>
                        <p className="text-gray-500 text-xs">{filteredProperties.length} propiedades encontradas</p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <input
                                type="date"
                                ref={dateInputRef}
                                onChange={handleDateFilter}
                                min="2000-01-01"
                                max="2100-12-31"
                                className="absolute opacity-0 pointer-events-none"
                            />
                            <button
                                onClick={() => dateInputRef.current?.showPicker()}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 text-black transition-colors"
                            >
                                <Calendar size={16} /> Filtrar por Fecha
                            </button>
                        </div>

                        <button
                            onClick={handleClearHistory}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg shadow-sm text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} /> Limpiar Historial
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                            Aún no has visto ninguna propiedad
                        </div>
                    ) : filteredProperties.length > 0 ? (
                        filteredProperties.map((prop: any) => (
                            <PropertyCard
                                key={prop.id}
                                prop={prop}
                                onVerDetalle={verDetallePropiedad}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                            No se encontraron propiedades para esta selección.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}