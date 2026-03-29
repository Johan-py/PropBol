"use client";

import { useState, useCallback } from "react";

type Categoria =
  | "CASA"
  | "DEPARTAMENTO"
  | "TERRENO"
  | "HABITACION"
  | "LOCAL";

type TipoAccion =
  | "VENTA"
  | "ALQUILER"
  | "ANTICRETO";

interface Property {

  id: number;
  titulo: string;
  tipoAccion: TipoAccion;
  categoria: Categoria | null;
  precio: number;

  superficieM2: number | null;
  nroCuartos: number | null;
  nroBanos: number | null;

  descripcion: string | null;
  estado: string;
  fechaPublicacion: string;

  propietarioId: number;

  ubicacion?: {
    direccion: string | null;
    zona: string | null;
    ciudad: string;
  } | null;

}

interface SearchParams {
  tipos?: Categoria[];
  modo?: TipoAccion;
}

export function usePropertySearch() {

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProperties = useCallback(async (params: SearchParams) => {

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {

      const urlParams = new URLSearchParams();

      if (params.tipos && params.tipos.length > 0) {
        params.tipos.forEach(tipo => {
          urlParams.append("categoria", tipo);
        });
      }

      if (params.modo) {
        urlParams.append("tipoAccion", params.modo);
      }

      const response = await fetch(
        `/api/properties/search?${urlParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      setProperties(data);

      const responseTime = Date.now() - startTime;
      console.log(`Búsqueda completada en ${responseTime}ms`);

    } catch (err) {

      const message =
        err instanceof Error ? err.message : "Error al buscar";

      setError(message);
      setProperties([]);

    } finally {
      setLoading(false);
    }

  }, []);

  return {
    properties,
    loading,
    error,
    searchProperties
  };
}