// frontend/src/components/VisualFilters/PropertyCarousel.tsx
"use client";

import { useRef } from "react";
import PropertyCard from "./PropertyCard";
import { useRouter } from "next/navigation";

interface CarouselItem {
  image: string;
  title: string;
  location: string;
  count?: number;
  filterParam: string; // param para la URL al hacer clic
}

interface PropertyCarouselProps {
  title: string;
  items: CarouselItem[];
  category: "alquiler" | "venta";
}

export default function PropertyCarousel({
  title,
  items,
  category,
}: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll con botones
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 180 : -180,
      behavior: "smooth",
    });
  };

  // Scroll con rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollBy({ left: e.deltaY * 2, behavior: "smooth" });
  };

  const handleCardClick = (filterParam: string) => {
    router.push(`/propiedades?categoria=${category}&zona=${filterParam}`);
  };

  return (
    <div className="mb-8">
      {/* Título de sección */}
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide mb-3">
        {title}
      </h2>

      {/* Carrusel */}
      <div className="relative flex items-center">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            absolute left-0 z-10 bg-white border border-gray-200
            rounded-full w-7 h-7 flex items-center justify-center
            shadow hover:bg-orange-500 hover:text-white hover:border-orange-500
            transition-colors duration-150 text-gray-600 text-xs
          "
        >
          ‹
        </button>

        {/* Items */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="
            flex gap-3 overflow-x-auto scroll-smooth
            px-8 py-1
            scrollbar-hide
          "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <PropertyCard
              key={i}
              image={item.image}
              title={item.title}
              location={item.location}
              count={item.count}
              onClick={() => handleCardClick(item.filterParam)}
            />
          ))}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="
            absolute right-0 z-10 bg-white border border-gray-200
            rounded-full w-7 h-7 flex items-center justify-center
            shadow hover:bg-orange-500 hover:text-white hover:border-orange-500
            transition-colors duration-150 text-gray-600 text-xs
          "
        >
          ›
        </button>
      </div>
    </div>
  );
}