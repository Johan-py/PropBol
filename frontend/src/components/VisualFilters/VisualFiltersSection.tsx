// frontend/src/components/VisualFilters/VisualFiltersSection.tsx
"use client";

import { useEffect, useState } from "react";
import PropertyCarousel from "./PropertyCarousel";
import PropertyTypeGrid from "./PropertyTypeGrid";

// Imágenes placeholder por ciudad (puedes reemplazar con reales)
const CITY_IMAGES: Record<string, string> = {
  "Santa Cruz": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
  "La Paz": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  "Cochabamba": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
  "Oruro": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80",
  "Potosí": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  default: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&q=80",
};

function getCityImage(city: string): string {
  return CITY_IMAGES[city] ?? CITY_IMAGES.default;
}

interface FilterData {
  nombre: string;
  total: number;
  categoria?: string;
}

interface FiltersResponse {
  alquileres: FilterData[];
  ventas: FilterData[];
  tipos: FilterData[];
}

export default function VisualFiltersSection() {
  const [data, setData] = useState<FiltersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/filters`
        );
        if (!res.ok) throw new Error("Error al cargar filtros");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("VisualFiltersSection:", err);
        // Si falla el backend, mostramos estructura vacía (no rompe UI)
        setData({ alquileres: [], ventas: [], tipos: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <section className="px-6 py-8 bg-gray-50">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-40 h-44 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-40 h-44 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
// Mapear datos a formato del carrusel (100% reales de la BD)
  const alquilerItems = (data?.alquileres ?? []).map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: `${item.total.toLocaleString()} propiedades`,
    count: item.total,
    filterParam: item.nombre,
  }));

  const ventaItems = (data?.ventas ?? []).map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: `${item.total.toLocaleString()} propiedades`,
    count: item.total,
    filterParam: item.nombre,
  }));

  const tipoItems = (data?.tipos ?? []).map((item) => ({
    key: item.nombre.toLowerCase().replace(/\s+/g, ""),
    label: item.nombre,
    count: item.total,
  }));

  return (
    <section className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[1100px]">

        {/* Alquileres */}
        {alquilerItems.length > 0 ? (
          <PropertyCarousel title="Alquileres" items={alquilerItems} category="alquiler" />
        ) : (
          <div className="mb-8">
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">Alquileres</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
              No hay resultados para mostrar en alquileres en este momento.
            </div>
          </div>
        )}

        {/* En Venta */}
        {ventaItems.length > 0 ? (
          <PropertyCarousel title="En Venta" items={ventaItems} category="venta" />
        ) : (
          <div className="mb-8">
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">En Venta</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
              No hay resultados para mostrar en ventas en este momento.
            </div>
          </div>
        )}

        {/* Por tipo */}
        {tipoItems.length > 0 ? (
          <PropertyTypeGrid items={tipoItems} />
        ) : (
          <div className="mb-8">
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">Por tipo de inmueble</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
              No hay categorías registradas.
            </div>
          </div>
        )}

      </div>
    </section>
  );
}