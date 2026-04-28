"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InfoPropiedad from "./InfoPropiedad";
import GaleriaResumen from "./GaleriaResumen";
import AceptacionPublicacion from "./AceptacionPublicacion";
import ParametrosPersonalizados from "./ParametrosPersonalizados";

interface Props {
  publicacionId: number | null;
}

type ParametroItem = {
  id: number;
  nombre: string;
};

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
  parametrosPersonalizados?: ParametroItem[];
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

function extraerParametro(item: unknown, index: number): ParametroItem | null {
  if (!item || typeof item !== "object") return null;

  const obj = item as Record<string, unknown>;

  if (typeof obj.nombre === "string" && obj.nombre.trim() !== "") {
    return {
      id:
        typeof obj.id === "number"
          ? obj.id
          : typeof obj.id === "string"
            ? Number(obj.id)
            : index,
      nombre: obj.nombre.trim(),
    };
  }

  if (
    typeof obj.nombreParametro === "string" &&
    obj.nombreParametro.trim() !== ""
  ) {
    return {
      id:
        typeof obj.id === "number"
          ? obj.id
          : typeof obj.id === "string"
            ? Number(obj.id)
            : index,
      nombre: obj.nombreParametro.trim(),
    };
  }

  if (obj.parametro && typeof obj.parametro === "object") {
    const parametro = obj.parametro as Record<string, unknown>;

    if (
      typeof parametro.nombre === "string" &&
      parametro.nombre.trim() !== ""
    ) {
      return {
        id:
          typeof parametro.id === "number"
            ? parametro.id
            : typeof parametro.id === "string"
              ? Number(parametro.id)
              : index,
        nombre: parametro.nombre.trim(),
      };
    }
  }

  if (
    obj.parametroPersonalizado &&
    typeof obj.parametroPersonalizado === "object"
  ) {
    const parametro = obj.parametroPersonalizado as Record<string, unknown>;

    if (
      typeof parametro.nombre === "string" &&
      parametro.nombre.trim() !== ""
    ) {
      return {
        id:
          typeof parametro.id === "number"
            ? parametro.id
            : typeof parametro.id === "string"
              ? Number(parametro.id)
              : index,
        nombre: parametro.nombre.trim(),
      };
    }
  }

  if (
    obj.parametros_personalizados &&
    typeof obj.parametros_personalizados === "object"
  ) {
    const parametro = obj.parametros_personalizados as Record<string, unknown>;

    if (
      typeof parametro.nombre === "string" &&
      parametro.nombre.trim() !== ""
    ) {
      return {
        id:
          typeof parametro.id === "number"
            ? parametro.id
            : typeof parametro.id === "string"
              ? Number(parametro.id)
              : index,
        nombre: parametro.nombre.trim(),
      };
    }
  }

  if (obj.etiqueta && typeof obj.etiqueta === "object") {
    const etiqueta = obj.etiqueta as Record<string, unknown>;

    if (typeof etiqueta.nombre === "string" && etiqueta.nombre.trim() !== "") {
      return {
        id:
          typeof etiqueta.id === "number"
            ? etiqueta.id
            : typeof etiqueta.id === "string"
              ? Number(etiqueta.id)
              : index,
        nombre: etiqueta.nombre.trim(),
      };
    }
  }

  return null;
}

function normalizarParametros(payload: unknown): ParametroItem[] {
  const colecciones: unknown[] = [];

  if (Array.isArray(payload)) {
    colecciones.push(payload);
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      colecciones.push(obj.data);
    }

    if (obj.data && typeof obj.data === "object") {
      const dataObj = obj.data as Record<string, unknown>;

      if (Array.isArray(dataObj.items)) {
        colecciones.push(dataObj.items);
      }

      if (Array.isArray(dataObj.parametros)) {
        colecciones.push(dataObj.parametros);
      }

      if (Array.isArray(dataObj.parametrosPersonalizados)) {
        colecciones.push(dataObj.parametrosPersonalizados);
      }

      if (Array.isArray(dataObj.data)) {
        colecciones.push(dataObj.data);
      }
    }

    if (Array.isArray(obj.items)) {
      colecciones.push(obj.items);
    }

    if (Array.isArray(obj.parametros)) {
      colecciones.push(obj.parametros);
    }

    if (Array.isArray(obj.parametrosPersonalizados)) {
      colecciones.push(obj.parametrosPersonalizados);
    }
  }

  for (const col of colecciones) {
    const normalizados = (col as unknown[])
      .map((item, index) => extraerParametro(item, index))
      .filter((item): item is ParametroItem => item !== null);

    if (normalizados.length > 0) {
      return normalizados.filter(
        (parametro, index, array) =>
          array.findIndex((x) => x.nombre === parametro.nombre) === index
      );
    }
  }

  return [];
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

async function obtenerParametrosPublicacion(
  publicacionId: number
): Promise<ParametroItem[]> {
  const token = getAuthToken();

  if (!publicacionId || Number.isNaN(publicacionId)) {
    return [];
  }

  if (!API_BASE_URL) {
    return [];
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/publicaciones/${publicacionId}/parametros`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const rawText = await response.text();
  let payload: unknown = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    console.error("La respuesta de /parametros no es JSON válido:", rawText);
    return [];
  }

  console.log("Respuesta RAW /parametros:", payload);

  if (!response.ok) {
    console.error("Error en /parametros:", response.status, payload);
    return [];
  }

  const normalizados = normalizarParametros(payload);
  console.log("Parámetros normalizados:", normalizados);

  return normalizados;
}

export default function ResumenPanel({ publicacionId }: Props) {
  const router = useRouter();
  const [aceptado, setAceptado] = useState(false);
  const [data, setData] = useState<ResumenFinalData | null>(null);
  const [parametrosExtra, setParametrosExtra] = useState<ParametroItem[]>([]);
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

        const [resumen, parametrosRutaNueva] = await Promise.all([
          obtenerResumenFinal(publicacionId),
          obtenerParametrosPublicacion(publicacionId),
        ]);

        console.log("Resumen final recibido:", resumen);
        console.log(
          "Parámetros desde resumen-final:",
          resumen.parametrosPersonalizados
        );
        console.log(
          "Parámetros desde /publicaciones/:id/parametros:",
          parametrosRutaNueva
        );

        setData(resumen);
        setParametrosExtra(parametrosRutaNueva);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar resumen");
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, [publicacionId]);

  const parametrosFinales = useMemo(() => {
    const desdeResumen = Array.isArray(data?.parametrosPersonalizados)
      ? data.parametrosPersonalizados.filter(
          (item) =>
            item &&
            typeof item.nombre === "string" &&
            item.nombre.trim() !== ""
        )
      : [];

    if (desdeResumen.length > 0) {
      return desdeResumen;
    }

    return parametrosExtra;
  }, [data, parametrosExtra]);

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
        <div className="mb-3 text-sm text-gray-500">
          Home <span className="mx-2">{">"}</span> Publicar propiedades{" "}
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-700">
            Ver resumen final de la propiedad antes de confirmar
          </span>
        </div>

        <h1 className="mb-6 text-2xl font-bold leading-tight text-[#0f172a] md:text-5xl">
          Ver resumen final de la propiedad antes de confirmar
        </h1>

        <div className="mb-8 overflow-hidden rounded-2xl border border-[#f1dfd0]">
          <div className="h-[3px] w-full bg-[#f28c28]" />
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="bg-white px-6 py-3 text-center text-sm font-medium text-[#2f241f] md:text-base">
              Paso 1: Datos Generales
            </div>
            <div className="bg-white px-6 py-3 text-center text-sm font-medium text-[#2f241f] md:text-base">
              Paso 2: Multimedia
            </div>
            <div className="bg-white px-6 py-3 text-center text-sm font-semibold text-[#2f241f] md:text-base">
              Paso 3: Parámetros Personalizados
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfc] p-4 md:p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#0f172a]">
            Resumen de la Propiedad
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[#ececec] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <InfoPropiedad data={data} />
            </div>

            <div className="rounded-[24px] border border-[#ececec] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <GaleriaResumen multimedia={data.multimedia} />
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#ececec] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <ParametrosPersonalizados parametros={parametrosFinales} />
          </div>

          <div className="mt-8 flex justify-center">
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