"use client";
interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  count?: number;
  onClick?: () => void;
  variant?: "alquiler" | "venta";
  isEmpty?: boolean;
}

export default function PropertyCard({
  image,
  title,
  location,
  count,
  onClick,
  variant = "alquiler",
  isEmpty = false,
}: PropertyCardProps) {
   const isAlquiler = variant === "alquiler";

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl overflow-hidden bg-white
        shadow-sm border border-gray-100
        transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${isAlquiler ? "min-w-[200px] w-[200px]" : "min-w-[160px] w-[160px]"}
        flex-shrink-0
      `}
    >
      {/* Imagen */}
      <div
        className={`
          relative w-full overflow-hidden bg-gray-100
          ${isAlquiler ? "h-[140px]" : "h-[100px]"}
        `}
      >
        {isEmpty ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-gray-300"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] font-medium text-gray-400">Sin imagen</span>
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {/* ALQUILERES */}
        {isAlquiler && count !== undefined && (
          <span
            className={`
              absolute top-2 right-2 text-white text-[9px] font-bold
              px-2 py-0.5 rounded-full tracking-wide
              ${isEmpty ? "bg-gray-400" : "bg-orange-500"}
            `}
          >
            {isEmpty ? "SIN DATOS" : `${count.toLocaleString()} PROPIEDADES`}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-[11px] font-bold text-gray-800 uppercase truncate">
          {title}
        </p>
        <p className="text-[10px] text-gray-500 truncate">
          {isEmpty ? "No disponible" : location}
        </p>

        {/* EN VENTA */}
        {!isAlquiler && count !== undefined && (
          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-[10px] font-semibold ${
                isEmpty ? "text-gray-400" : "text-orange-500"
              }`}
            >
              {isEmpty ? "Sin propiedades" : `${count.toLocaleString()} Propiedades`}
            </span>
            {!isEmpty && (
              <span className="text-orange-400 text-[10px]">→</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}