"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import InfoPropiedad from "./InfoPropiedad";
import GaleriaResumen from "./GaleriaResumen";
import AceptacionPublicacion from "./AceptacionPublicacion";
import ParametrosPersonalizados from "./ParametrosPersonalizados";

import PublicarModal from "../publicacion/PublicarModal";
import { EstadoPublicacion } from "../../types/publicacion";

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
  
  const [estadoPublicacion, setEstadoPublicacion] = useState<EstadoPublicacion>("idle");
  const [progreso, setProgreso] = useState(0);

  const isCancelled = useRef(false);
  const isPaused = useRef(false);

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

  useEffect(() => {
    if (estadoPublicacion !== "publicando") return;

    const handleUnload = () => {
      const token = getAuthToken();
      if (token && publicacionId) {
        fetch(`${API_BASE_URL}/api/publicaciones/${publicacionId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          keepalive: true, 
        }).catch(() => {});
      }
    };

    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [estadoPublicacion, publicacionId]);

  const confirmarPublicacion = () => {
    if (!aceptado) return;
    setEstadoPublicacion("confirmando");
  };

  const ejecutarPublicacion = async () => {
    isCancelled.current = false;
    isPaused.current = false;
    setEstadoPublicacion("publicando");
    setProgreso(0);

    try {
      const cantidadImagenes = data?.multimedia?.imagenes?.length || 0;
      const cantidadVideos = data?.multimedia?.videos?.length || 0;
      
      let progresoActual = 0;

      const checkEstado = async () => {
        while (isPaused.current && !isCancelled.current) {
          await new Promise((r) => setTimeout(r, 200)); 
        }
        if (isCancelled.current) throw new Error("CANCELADO"); 
      };

      await checkEstado();
      await new Promise((resolve) => setTimeout(resolve, 600));
      await checkEstado();
      progresoActual += 40;
      setProgreso(progresoActual);

      if (cantidadImagenes > 0) {
        for (let i = 0; i < cantidadImagenes; i++) {
          await checkEstado();
          await new Promise((resolve) => setTimeout(resolve, 400));
          await checkEstado();
          progresoActual += 8;
          setProgreso(progresoActual);
        }
      }

      if (cantidadVideos > 0) {
        for (let i = 0; i < cantidadVideos; i++) {
          await checkEstado();
          await new Promise((resolve) => setTimeout(resolve, 600));
          await checkEstado();
          progresoActual += 10;
          setProgreso(progresoActual);
        }
      }

      await checkEstado();
      await new Promise((resolve) => setTimeout(resolve, 400));
      await checkEstado();

      const token = getAuthToken();
      if (token && publicacionId) {
        // NOTA: Puse método POST, si el backend usa PUT o PATCH, solo cambias esa palabrita.
        const confirmarRes = await fetch(`${API_BASE_URL}/api/publicaciones/${publicacionId}/confirmar`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!confirmarRes.ok) {
          throw new Error("Error en el servidor al confirmar publicación");
        }
      }
    
      setProgreso(100);
      setEstadoPublicacion("exito");

      setTimeout(() => {
        if (!isCancelled.current) router.push("/");
      }, 2000);

    } catch (err) {
      if (err instanceof Error && err.message === "CANCELADO") {
        setProgreso(0);
        setEstadoPublicacion("idle");
      } else {
        // Si falla el endpoint de confirmar, caerá aquí y mostrará la pantalla roja de error
        setEstadoPublicacion("error_publicacion");
      }
    }
  };

  const handleCancelar = async () => {
    isCancelled.current = true;
    setProgreso(0);

    if (estadoPublicacion === "publicando") {
      try {
        const token = getAuthToken();
        if (token && publicacionId) {
          await fetch(`${API_BASE_URL}/api/publicaciones/${publicacionId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        console.error("Error al eliminar la publicación abortada:", error);
      }
      
      setEstadoPublicacion("idle");
      router.push("/");
      return;
    }

    setEstadoPublicacion("idle");
  };

  const handlePausar = (pausado: boolean) => {
    isPaused.current = pausado;
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
              onClick={confirmarPublicacion}
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

      {estadoPublicacion !== "idle" && (
        <PublicarModal
          estado={estadoPublicacion as any}
          progreso={progreso}
          onConfirmar={ejecutarPublicacion}
          onCancelar={handleCancelar}
          onReintentar={() => setEstadoPublicacion("confirmando")}
          onPausar={handlePausar}
        />
      )}
    </>
  );
}