"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InfoPropiedad from "./InfoPropiedad";
import GaleriaResumen from "./GaleriaResumen";
import AceptacionPublicacion from "./AceptacionPublicacion";
import ParametrosPersonalizados from "./ParametrosPersonalizados";

interface Props {
  publicacionId: number | null;
}

export interface ResumenFinalData {
  id: number;
  publicacionId: number;
  inmuebleId: number;
  publicacion: {
    titulo: string | null;
    descripcion: string | null;
    estado: string;
    fechaPublicacion: string | null;
  };
  datosGenerales: {
    tipoOperacion: string | null;
    tipoInmueble: string | null;
    direccion: string | null;
    ciudad: string | null;
    zona: string | null;
    precio: number | null;
    areaM2: number | null;
    coordenadas: {
      latitud: number | null;
      longitud: number | null;
    };
  };
  caracteristicas: {
    habitaciones: number | null;
    banos: number | null;
    estacionamiento: number | null;
  };
  parametrosPersonalizados: Array<{
    id: number;
    nombre: string;
  }>;
  multimedia: {
    total: number;
    imagenes: Array<{
      id: number;
      url: string;
      tipo: string;
      pesoMb: number | null;
    }>;
    videos: Array<{
      id: number;
      url: string;
      tipo: string;
      pesoMb: number | null;
    }>;
  };
  soloLectura: boolean;
}

interface ResumenFinalApiResponse {
  ok: boolean;
  data: ResumenFinalData;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    null
  );
}

async function obtenerResumenFinal(
  publicacionId: number
): Promise<ResumenFinalData> {
  const token = getAuthToken();

  if (!publicacionId || Number.isNaN(publicacionId)) {
    throw new Error("No se recibió un id válido de publicación");
  }

  if (!token) {
    throw new Error("No se encontró el token de autenticación");
  }

  if (!API_BASE_URL) {
    throw new Error(
      "La variable NEXT_PUBLIC_API_URL no está configurada en el frontend"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/publicaciones/${publicacionId}/resumen-final`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const payload: ResumenFinalApiResponse | { ok: false; message?: string } =
    await response.json();

  if (!response.ok || !("ok" in payload) || !payload.ok) {
    const message =
      "message" in payload && payload.message
        ? payload.message
        : "No se pudo obtener el resumen final";
    throw new Error(message);
  }

  return payload.data;
}

export default function ResumenPanel({ publicacionId }: Props) {
  const router = useRouter();
  const [aceptado, setAceptado] = useState(false);
  const [data, setData] = useState<ResumenFinalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  useEffect(() => {
    if (!publicacionId) {
      setLoading(false);
      setError("No se recibió el id de la publicación");
      return;
    }

    const cargarResumen = async () => {
      try {
        setLoading(true);
        setError("");
        const resumen = await obtenerResumenFinal(publicacionId);
        setData(resumen);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar resumen");
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, [publicacionId]);

  const abrirModalExito = () => {
    if (!aceptado) return;
    setMostrarModalExito(true);
  };

  const cerrarModalExito = () => {
    setMostrarModalExito(false);
  };

  const irAlHome = () => {
    setMostrarModalExito(false);
    router.push("/");
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl rounded-[28px] bg-white p-8 shadow-sm">
        <p className="text-lg text-gray-600">Cargando resumen final...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl rounded-[28px] bg-white p-8 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-[#0f172a]">
          Resumen final
        </h2>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!data) return null;

  return (
    <>
      <section className="mx-auto max-w-7xl rounded-[28px] bg-white p-5 shadow-sm md:p-8">
        <div className="mb-4 text-sm text-gray-500">
          Home <span className="mx-2">{">"}</span> Publicar propiedades{" "}
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-700">
            Ver resumen final de la propiedad antes de confirmar
          </span>
        </div>

        <h1 className="mb-5 text-2xl font-bold text-[#0f172a] md:text-5xl">
          Ver resumen final de la propiedad antes de confirmar
        </h1>

        <div className="mb-8 h-1 w-full rounded-full bg-orange-500" />

        <div className="rounded-[24px] border border-gray-200 bg-white p-4 md:p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#0f172a]">
            Resumen de la Propiedad
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col gap-6">
              <InfoPropiedad data={data} />
              <ParametrosPersonalizados
                parametros={data.parametrosPersonalizados}
              />
            </div>

            <GaleriaResumen multimedia={data.multimedia} />
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-[560px]">
              <AceptacionPublicacion
                aceptado={aceptado}
                setAceptado={setAceptado}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => window.history.back()}
              className="rounded-xl border border-gray-400 bg-white px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Volver
            </button>

            <button
              onClick={abrirModalExito}
              disabled={!aceptado}
              className={`rounded-xl px-6 py-4 text-lg font-semibold text-white transition ${
                aceptado
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "cursor-not-allowed bg-orange-300"
              }`}
            >
              Confirmar y Publicar
            </button>
          </div>
        </div>
      </section>

      {mostrarModalExito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="relative w-full max-w-[700px] rounded-[28px] bg-white px-6 py-10 shadow-2xl md:px-10 md:py-12">
            <button
              onClick={cerrarModalExito}
              className="absolute right-6 top-5 text-[40px] leading-none text-gray-400 transition hover:text-gray-600"
              aria-label="Cerrar modal"
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-7 flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[#f58600] text-[64px] font-bold text-white">
                ✓
              </div>

              <h3 className="mb-5 text-3xl font-bold text-[#4a3b39] md:text-[34px]">
                ¡Inmueble publicado con éxito!
              </h3>

              <p className="mb-9 text-xl text-gray-500 md:text-[22px]">
                Tu inmueble se ha publicado correctamente.
              </p>

              <button
                onClick={irAlHome}
                className="min-w-[220px] rounded-2xl bg-[#f58600] px-10 py-4 text-2xl font-semibold text-white transition hover:bg-[#de7800]"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

