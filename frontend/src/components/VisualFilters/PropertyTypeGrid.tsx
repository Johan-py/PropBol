"use client";

import { useRouter } from "next/navigation";

const icons: Record<string, React.ReactNode> = {
  casas: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  ),
  departamentos: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path strokeLinecap="round" d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  ),
  oficinas: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="1" />
      <path strokeLinecap="round" d="M8 4v16M16 4v16M2 12h20" />
    </svg>
  ),
  terrenos: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l5-5 4 4 5-6 4 3M3 21h18" />
    </svg>
  ),
};

interface TypeItem {
  key: string;
  label: string;
  count: number;
}

interface PropertyTypeGridProps {
  items: TypeItem[];
}

export default function PropertyTypeGrid({ items }: PropertyTypeGridProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">
        Por tipo de inmueble
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {items.map((item) => (
          <div
            key={item.key}
        onClick={() => {
       const tipoMap: Record<string, string> = {
         casas: "CASA",
          departamentos: "DEPARTAMENTO",
           oficinas: "OFICINA",
            terrenos: "TERRENO",
      };
      const params = new URLSearchParams({
         tipoInmueble: tipoMap[item.key] ?? item.key.toUpperCase(),
        modoInmueble: "VENTA", 
        });
        router.push(`/busqueda_mapa?${params.toString()}`);
          }}            
              className="
              flex flex-col items-center justify-center
              w-full py-4 rounded-xl bg-white
              border border-gray-100 shadow-sm cursor-pointer
              transition-all duration-200
              hover:shadow-md hover:border-orange-300 hover:scale-105
            "
          >
            <div className="text-orange-500 mb-1">{icons[item.key] ?? icons.casas}</div>
            <span className="text-[11px] font-semibold text-gray-700 capitalize">
              {item.label}
            </span>
            <span className="text-[10px] text-gray-400">
              {item.count.toLocaleString()} disp.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}