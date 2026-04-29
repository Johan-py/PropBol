import { useState, useEffect } from "react";
import { PropertyMapPin, PropertyType } from "@/types/property";
import { useSearchParams } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

interface RawPropertyItem {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: string | number;
  categoria?: string;
  currency?: string;
  moneda?: string;
  nroCuartos?: number;
  nroBanos?: number;
  superficieM2?: string | number;
  ubicacion?: { latitud: string | number; longitud: string | number };
  ubicacion_inmueble?: { latitud: string | number; longitud: string | number };
  publicaciones?: Array<{ multimedia?: Array<{ url: string }> }>;
  publicacion?: Array<{ multimedia?: Array<{ url: string }> }>;
}
const BOB_EXCHANGE_RATE = 6.96;

interface UsePropertiesResult {
  properties: PropertyMapPin[];
  isLoading: boolean;
  error: string | null;
}

export function useProperties(): UsePropertiesResult {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyMapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParamsStr = searchParams.toString();

  useEffect(() => {
    let cancelled = false
    console.log('🔄 useProperties disparado:', searchParamsStr)

    async function fetchNormalSearch() {
      try {
        const res = await fetch(
          `${API_URL}/api/properties/inmuebles?${searchParamsStr}`,
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const json = await res.json();

        const selectedCurrency = (
          (searchParams.get("currency") || "USD").toUpperCase() === "BOB"
            ? "BOB"
            : "USD"
        ) as "USD" | "BOB";

        if (!cancelled) {
          const mappedData: PropertyMapPin[] = (json.data || [])
            .filter((item: RawPropertyItem) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble;
              const lat = Number(ubicacion?.latitud);
              const lng = Number(ubicacion?.longitud);
              return (
                ubicacion &&
                !isNaN(lat) &&
                !isNaN(lng) &&
                lat !== 0 &&
                lng !== 0
              );
            })
            .map((item: RawPropertyItem) => {
              const ubicacion = (item.ubicacion ?? item.ubicacion_inmueble)!;
              const publicaciones =
                item.publicaciones ?? item.publicacion ?? [];
              const basePrice = Number(item.precio);
              const sourceCurrency = String(
                item.currency || item.moneda || "USD",
              ).toUpperCase();
              const priceInUsd =
                sourceCurrency === "BOB"
                  ? basePrice / BOB_EXCHANGE_RATE
                  : basePrice;
              const displayPrice =
                selectedCurrency === "BOB"
                  ? priceInUsd * BOB_EXCHANGE_RATE
                  : priceInUsd;
              const formattedText =
                selectedCurrency === "BOB"
                  ? `Bs ${displayPrice.toLocaleString("es-BO")}`
                  : `$${displayPrice.toLocaleString("en-US")} USD`;

              return {
                id: item.id.toString(),
                lat: Number(ubicacion.latitud),
                lng: Number(ubicacion.longitud),
                price: displayPrice,
                currency: selectedCurrency,
                precioFormateado: formattedText,
                type: (item.categoria?.toLowerCase().trim() ||
                  "casa") as PropertyType,
                title: item.titulo,
                descripcion: item.descripcion ?? null,
                nroCuartos: item.nroCuartos ?? null,
                nroBanos: item.nroBanos ?? null,
                superficieM2: item.superficieM2
                  ? Number(item.superficieM2)
                  : null,
                thumbnailUrl:
                  publicaciones?.[0]?.multimedia?.[0]?.url ?? undefined,
              };
            });
          setProperties(mappedData);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "Error al conectar con PropBol",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    async function fetchProperties() {
      setIsLoading(true)
      setError(null)

      // ✅ Verificar si estamos en modo recomendados
      const modoRecomendados = sessionStorage.getItem('propbol_modo_recomendados')
      const resultadosRecomendados = sessionStorage.getItem('propbol_recomendados')

      if (modoRecomendados === 'true' && resultadosRecomendados) {
        console.log('🎯 Usando resultados de recomendados desde sessionStorage')

        try {
          const data = JSON.parse(resultadosRecomendados)
          const selectedCurrency =
            (searchParams.get('currency') || 'USD').toUpperCase() === 'BOB' ? 'BOB' : 'USD'

          const mappedData: PropertyMapPin[] = data
            .filter((item: any) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble
              const lat = Number(ubicacion?.latitud)
              const lng = Number(ubicacion?.longitud)
              return ubicacion && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
            })
            .map((item: any) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble
              const publicaciones = item.publicaciones ?? item.publicacion ?? []
              const basePrice = Number(item.precio)
              const sourceCurrency = String(item.currency || item.moneda || 'USD').toUpperCase()
              const priceInUsd =
                sourceCurrency === 'BOB' ? basePrice / BOB_EXCHANGE_RATE : basePrice
              const displayPrice =
                selectedCurrency === 'BOB' ? priceInUsd * BOB_EXCHANGE_RATE : priceInUsd
              const formattedText =
                selectedCurrency === 'BOB'
                  ? `Bs ${displayPrice.toLocaleString('es-BO')}`
                  : `$${displayPrice.toLocaleString('en-US')} USD`

              return {
                id: item.id.toString(),
                lat: Number(ubicacion.latitud),
                lng: Number(ubicacion.longitud),
                price: displayPrice,
                currency: selectedCurrency,
                precioFormateado: formattedText,
                type: (item.categoria?.toLowerCase().trim() || 'casa') as any,
                title: item.titulo,
                descripcion: item.descripcion ?? null,
                nroCuartos: item.nroCuartos ?? null,
                nroBanos: item.nroBanos ?? null,
                superficieM2: item.superficieM2 ? Number(item.superficieM2) : null,
                thumbnailUrl: publicaciones?.[0]?.multimedia?.[0]?.url ?? undefined,
                score: item.score,
                razones: item.razones
              }
            })

          if (!cancelled) {
            setProperties(mappedData)
            // Limpiar sessionStorage después de usar
            sessionStorage.removeItem('propbol_modo_recomendados')
            sessionStorage.removeItem('propbol_recomendados')
          }
        } catch (err) {
          console.error('Error parseando recomendados:', err)
          // Fallback a búsqueda normal
          await fetchNormalSearch()
        } finally {
          if (!cancelled) setIsLoading(false)
        }
        return
      }

      // Si no es modo recomendados, búsqueda normal
      await fetchNormalSearch()
    }

    fetchProperties()
    return () => {
      cancelled = true
    }
  }, [searchParamsStr, searchParams])

  return { properties, isLoading, error };
}
