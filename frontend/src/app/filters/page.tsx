"use client";

import { useState } from "react";
import FilterBar from "@/components/filters/FilterBar";

export default function FiltersPage() {

  const [resultados, setResultados] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (filtros: { tipos: string[]; modo: string }) => {

    setCargando(true);
    setError(null);

    try {

      const params = new URLSearchParams();

      filtros.tipos.forEach(tipo => {
        params.append("categoria", tipo);
      });

      params.append("tipoAccion", filtros.modo);

      const response = await fetch(
        `http://localhost:5000/api/properties/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      setResultados(data);

    } catch (err) {

      const message =
        err instanceof Error ? err.message : "Error desconocido";

      setError(message);
      console.error("Error:", err);

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-32 px-4">

      <FilterBar onSearch={handleSearch} />

      <div className="mt-8 w-full max-w-4xl">

        <h2 className="text-lg font-bold mb-4">Resultados (JSON):</h2>

        {cargando && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Buscando...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">❌ Error: {error}</p>
            <p className="text-sm text-red-500 mt-1">
              Asegúrate que el backend está corriendo en http://localhost:5000
            </p>
          </div>
        )}

        {!cargando && !error && resultados && (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
            {JSON.stringify(resultados, null, 2)}
          </pre>
        )}

      </div>

    </div>
  );
}