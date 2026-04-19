"use client";

import { useEffect, useState } from "react";
import PropertyCarousel from "./PropertyCarousel";
import PropertyTypeGrid from "./PropertyTypeGrid";

const CITY_IMAGES: Record<string, string> = {
  "Santa Cruz": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
  "La Paz": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  "Cochabamba": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
  "Oruro": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80",
  "Potosí": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  "Sucre": "https://images.unsplash.com/photo-1549417229-aa67d3263ad5?w=400&q=80",
  "Beni": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80",
  "Tarija": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80",
  "Pando": "https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&q=80",
  default: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&q=80",
};

const CIUDADES_BASE = [
  "Santa Cruz",
  "La Paz",
  "Cochabamba",
  "Oruro",
  "Potosí",
  "Sucre",
  "Tarija",
  "Beni",
  "Pando",
];

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

function mergeCiudadesConDatos(
  base: string[],
  datos: FilterData[]
): FilterData[] {
  return base.map((ciudad) => {
    const found = datos.find(
      (d) => d.nombre.toLowerCase() === ciudad.toLowerCase()
    );
    return found ?? { nombre: ciudad, total: 0 };
  });
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
        
        setData({ alquileres: [], ventas: [], tipos: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 md:px-8 py-8 flex justify-center">
        <div className="w-full max-w-[1100px] animate-pulse space-y-8">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[200px] h-[200px] bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[160px] h-[160px] bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const alquileresConBase = mergeCiudadesConDatos(
    CIUDADES_BASE,
    data?.alquileres ?? []
  );
  const ventasConBase = mergeCiudadesConDatos(
    CIUDADES_BASE,
    data?.ventas ?? []
  );

  const alquilerItems = alquileresConBase.map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: `${item.total.toLocaleString()} propiedades`,
    count: item.total,
    filterParam: item.nombre,
  }));

  const ventaItems = ventasConBase.map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: `${item.total.toLocaleString()} propiedades`,
    count: item.total,
    filterParam: item.nombre,
  }));

  const tiposBase = ["casas", "departamentos", "oficinas", "terrenos"];
  const tipoItems = tiposBase.map((base) => {
    const found = (data?.tipos ?? []).find((t) =>
      t.nombre.toLowerCase().includes(base)
    );
    return found
      ? {
          key: found.nombre.toLowerCase().replace(/\s+/g, ""),
          label: found.nombre,
          count: found.total,
        }
      : {
          key: base,
          label: base.charAt(0).toUpperCase() + base.slice(1),
          count: 0,
        };
  });

  return (
    <section className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[1100px]">

        {/* ALQUILERES */}
        <PropertyCarousel
          title="Alquileres"
          items={alquilerItems}
          category="alquiler"
        />

        {/* EN VENTA */}
        <PropertyCarousel
          title="En Venta"
          items={ventaItems}
          category="venta"
        />

        {/* POR TIPO DE INMUEBLE */}
        <PropertyTypeGrid items={tipoItems} />

      </div>
    </section>
  );
}