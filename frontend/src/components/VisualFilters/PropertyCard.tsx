"use client";

import { useEffect, useState } from "react";

interface Preview {
  imagen: string;
  titulo: string;
}
interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  count?: number;
  onClick?: () => void;
  variant?: "alquiler" | "venta";
  isEmpty?: boolean;
  previews?: Preview[];
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}/${url.replace(/^\/+/, "")}`;
};

export default function PropertyCard({
  image,
  title,
  location,
  count,
  onClick,
  variant = "alquiler",
  isEmpty = false,
  previews = [],
}: PropertyCardProps) {
  const isAlquiler = variant === "alquiler";

  const slides: Preview[] =
    previews.length > 0
      ? previews.map(p => ({ ...p, imagen: getImageUrl(p.imagen) }))
      : [{ imagen: getImageUrl(image), titulo: title }];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
  const showImage = !!currentSlide.imagen;


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
        {isEmpty || !showImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-1">
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
          <>
            <img
              key={currentIndex}
              src={currentSlide.imagen}
              alt={currentSlide.titulo}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const cityFallback = getImageUrl(image);
                if (cityFallback && img.src !== cityFallback) {
                  img.src = cityFallback;
                } else {
                  img.src = "/placeholder-house.jpg";
                }
              }}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Título del inmueble rotando */}
            {previews.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                <p className="text-white text-[9px] font-medium truncate">
                  {currentSlide.titulo}
                </p>
              </div>
            )}

            {/* Indicadores de slide */}
            {slides.length > 1 && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? "bg-white" : "bg-white/40"
                      }`}
                  />
                ))}
              </div>
            )}
          </>
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
            {isEmpty ? "SIN DATOS" : `${count.toLocaleString()} PROP.`}
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
              className={`text-[10px] font-semibold ${isEmpty ? "text-gray-400" : "text-orange-500"
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