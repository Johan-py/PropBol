<<<<<<< HEAD
<<<<<<< HEAD
'use client'

import { useRouter } from 'next/navigation'

import CityCard from '@/components/home/CityCard'
import { useCitiesCarousel } from '@/hooks/useCitiesCarousel'
import type { City } from '@/types/city'

const featuredCities: City[] = [
  {
    id: 1,
    name: 'Cochabamba',
    slug: 'cochabamba',
    description: 'Explora zonas residenciales y sectores con alta demanda de vivienda.',
    images: ['/placeholder-house.jpg', '/icons/fondoTerminos.jpg']
  },
  {
    id: 2,
    name: 'Santa Cruz',
    slug: 'santa-cruz',
    description: 'Descubre barrios en crecimiento y oportunidades inmobiliarias destacadas.',
    images: ['/icons/fondoTerminos.jpg', '/placeholder-house.jpg']
  },
  {
    id: 3,
    name: 'La Paz',
    slug: 'la-paz',
    description: 'Encuentra alternativas urbanas con vistas, conectividad y oferta variada.',
    images: ['/placeholder-house.jpg', '/house.svg']
  }
]

export default function FeaturedCitiesSection() {
  const router = useRouter()
  const { index, next, prev } = useCitiesCarousel(featuredCities.length)
  const currentCity = featuredCities[index]

  const handleClick = (slug: string) => {
    router.push(`/busqueda?ciudad=${slug}`)
  }

  return (
    <section className="px-6 py-10 sm:px-8 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 sm:text-4xl md:text-5xl">
          ¿Dónde quieres vivir?
        </h2>

        <p className="mt-3 max-w-2xl text-base text-stone-600 sm:text-lg">
          Explora las ciudades más buscadas
        </p>

        <div className="mt-8 w-full rounded-[2rem] border border-stone-200/80 bg-stone-50/60 px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              aria-label="Ver ciudad anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl text-amber-600 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            <div className="w-full max-w-sm sm:max-w-md">
              <CityCard city={currentCity} onClick={handleClick} />
            </div>

            <button
              type="button"
              onClick={next}
              disabled={index === featuredCities.length - 1}
              aria-label="Ver siguiente ciudad"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl text-amber-600 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {featuredCities.map((city, cityIndex) => (
              <span
                key={city.id}
                className={`h-2.5 rounded-full transition-all ${
                  cityIndex === index ? 'w-8 bg-amber-500' : 'w-2.5 bg-stone-300'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
=======
"use client"
=======
"use client";
>>>>>>> ae8074f43afab57f05b9fb8258dffe280cac5aca

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CityCard from "@/components/home/CityCard";
import { useCitiesCarousel } from "@/hooks/useCitiesCarousel";
import { City } from "@/types/city";

type Props = {
  cities: City[];
};

const SWIPE_THRESHOLD = 56;

function getVisibleColumns(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function FeaturedCitiesSectionSkeleton() {
  return (
    <section className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mx-auto h-10 w-80 animate-pulse rounded-xl bg-stone-100" />
        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded-xl bg-stone-100" />
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-stone-200/80 bg-white/60 px-6 py-10 shadow-sm backdrop-blur sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`featured-city-skeleton-${index}`}
              className="overflow-hidden rounded-2xl bg-white shadow"
            >
              <div className="h-48 animate-pulse bg-stone-100" />
              <div className="space-y-4 p-6">
                <div className="mx-auto h-7 w-40 animate-pulse rounded-lg bg-stone-100" />
                <div className="mx-auto h-4 w-32 animate-pulse rounded-lg bg-stone-100" />
                <div className="space-y-2">
                  <div className="h-4 animate-pulse rounded-lg bg-stone-100" />
                  <div className="h-4 animate-pulse rounded-lg bg-stone-100" />
                </div>
                <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
              </div>
            </div>
          ))}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
        </div>
      </div>
    </section>
  );
}
<<<<<<< HEAD
=======

export default function FeaturedCitiesSection({ cities }: Props) {
  const router = useRouter();
  const touchStartXRef = useRef<number | null>(null);

  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const syncColumns = () => {
      setColumns(getVisibleColumns(window.innerWidth));
    };

    syncColumns();
    window.addEventListener("resize", syncColumns);

    return () => {
      window.removeEventListener("resize", syncColumns);
    };
  }, []);

  const pages = useMemo(() => {
    const groupedCities: City[][] = [];

    for (let pageIndex = 0; pageIndex < cities.length; pageIndex += columns) {
      groupedCities.push(cities.slice(pageIndex, pageIndex + columns));
    }

    return groupedCities;
  }, [cities, columns]);

  const totalPages = pages.length;

  const { index, next, prev, goTo } = useCitiesCarousel(totalPages);

  const handleClick = (city: City) => {
    const params = new URLSearchParams({
      query: city.name,
    });

    router.push(`/busqueda?${params.toString()}`);
  };

  if (cities.length === 0) {
    return (
      <section className="px-6 py-10 text-center sm:px-8 lg:px-10">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 sm:text-4xl">
          ¿Dónde quieres vivir?
        </h2>
        <p className="mt-3 text-base text-stone-600 sm:text-lg">
          Explora las ciudades más buscadas por otros usuarios
        </p>
        <p className="mt-10 text-stone-600">No hay ciudades disponibles</p>
      </section>
    );
  }

  const shouldPaginate = totalPages > 1;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (touchStartX === null || touchEndX === undefined) return;

    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) return;

    if (swipeDistance < 0) {
      next();
      return;
    }

    prev();
  };

  return (
    <section className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 sm:text-4xl">
          ¿Dónde quieres vivir?
        </h2>
        <p className="mt-3 text-base text-stone-600 sm:text-lg">
          Explora las ciudades más buscadas por otros usuarios
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-stone-200/80 bg-white/60 px-6 py-10 shadow-sm backdrop-blur sm:px-8">
        <div className="flex items-center gap-4">
          {shouldPaginate ? (
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-amber-500 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 lg:inline-flex"
              aria-label="Mostrar ciudades anteriores"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <div
            className="flex-1 overflow-hidden"
            onTouchStart={shouldPaginate ? handleTouchStart : undefined}
            onTouchEnd={shouldPaginate ? handleTouchEnd : undefined}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {pages.map((page, pageIndex) => (
                <div
                  key={`cities-page-${columns}-${pageIndex}`}
                  className="w-full shrink-0"
                >
                  <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {page.map((city) => (
                      <div key={city.id} className="w-full max-w-sm">
                        <CityCard city={city} onClick={handleClick} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shouldPaginate ? (
            <button
              type="button"
              onClick={next}
              disabled={index >= totalPages - 1}
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-amber-500 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300 lg:inline-flex"
              aria-label="Mostrar ciudades siguientes"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>

        {shouldPaginate ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-amber-500 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300"
                aria-label="Mostrar ciudades anteriores"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={next}
                disabled={index >= totalPages - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-amber-500 shadow-sm transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:text-stone-300"
                aria-label="Mostrar ciudades siguientes"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
                Pagina {index + 1} de {totalPages}
              </p>

              <div className="flex items-center justify-center gap-3">
                {Array.from({ length: totalPages }, (_, dotIndex) => (
                  <button
                    key={`cities-page-${dotIndex + 1}`}
                    type="button"
                    onClick={() => goTo(dotIndex)}
                    className={`h-2.5 rounded-full transition-all ${
                      dotIndex === index ? "w-8 bg-amber-500" : "w-2.5 bg-stone-300"
                    }`}
                    aria-label={`Mostrar grupo de ciudades ${dotIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
