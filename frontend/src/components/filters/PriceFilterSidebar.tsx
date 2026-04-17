"use client";

import { useState, useEffect } from "react";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useRouter, useSearchParams } from "next/navigation";
interface PriceFilterSidebarProps {
  onClose: () => void;
}
export default function PriceFilterSidebar({ onClose }: PriceFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateFilters } = useSearchFilters();

  const [moneda, setMoneda] = useState<"BOB" | "USD">("BOB");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Cargar valores iniciales si existen en la URL o SessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("propbol_global_filters");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.minPrice) setMinPrice(parsed.minPrice);
      if (parsed.maxPrice) setMaxPrice(parsed.maxPrice);
      if (parsed.currency) setMoneda(parsed.currency);
    }
  }, []);

  const handleApply = () => {
    const nuevosFiltros = {
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      currency: moneda,
      updatedAt: new Date().toISOString(),
    };

    updateFilters(nuevosFiltros);

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    params.set("currency", moneda);

    router.push(`/busqueda_mapa?${params.toString()}`);
    onClose();
  };

  return (
    <div className="flex flex-col gap-8 p-6 w-full max-w-[350px] bg-white h-full border-r border-stone-200">
      
      <div>
        <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide mb-1">
          Filtrar por Precio
        </h3>
        <p className="text-sm text-stone-500 mb-4">Seleccione el tipo de moneda:</p>

        {/* Toggle de Moneda */}
        <div className="flex bg-stone-100 rounded-full p-1 w-fit mb-6 shadow-inner">
          <button
            onClick={() => setMoneda("BOB")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === "BOB"
                ? "bg-[#d97706] text-white shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            $BOB
          </button>
          <button
            onClick={() => setMoneda("USD")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === "USD"
                ? "bg-[#d97706] text-white shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            $USD
          </button>
        </div>

        {/* Inputs Desde / Hasta */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Desde:</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Hasta:</span>
            <input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Input de Rango Visual (Opcional, usando input type="range" nativo) */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="font-bold text-xs text-stone-400 uppercase tracking-wide">
          Rango de Precio
        </label>
        <div className="flex items-center gap-2 mb-2">
          <div className="border border-stone-200 rounded-md px-3 py-1.5 text-xs text-stone-600 flex-1 text-center">
            {minPrice || "0"} {moneda}
          </div>
          <span className="text-stone-400">-</span>
          <div className="border border-stone-200 rounded-md px-3 py-1.5 text-xs text-stone-600 flex-1 text-center">
            {maxPrice || "10K"} {moneda}
          </div>
        </div>
        
        {/* Aquí podrías usar una librería como 'rc-slider' si necesitas un slider de dos puntos (dual thumb), 
            ya que HTML nativo solo soporta un punto. Por ahora ponemos un input range simple como placeholder */}
        <input 
          type="range" 
          className="w-full accent-[#d97706]" 
          min="0" 
          max="10000" 
          step="100"
          value={maxPrice || 10000}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* Botón Aplicar */}
      <button
        onClick={handleApply}
        className="mt-6 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md"
      >
        Aplicar
      </button>

    </div>
  );
}