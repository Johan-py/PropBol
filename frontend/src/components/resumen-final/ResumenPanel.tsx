"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
    imagenes: any[];
    videos: any[];
  };
  soloLectura: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
}

export default function ResumenPanel({ publicacionId }: Props) {
  const router = useRouter();

  const [aceptado, setAceptado] = useState(false);
  const [data, setData] = useState<ResumenFinalData | null>(null);
  const [parametrosExtra, setParametrosExtra] = useState<ParametroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [estadoPublicacion, setEstadoPublicacion] =
    useState<EstadoPublicacion>("idle");
  const [progreso, setProgreso] = useState(0);

  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const isCancelled = useRef(false);
  const isPaused = useRef(false);

  // ================= FETCH =================
  useEffect(() => {
    if (!publicacionId) {
      setError("No se recibió el id");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = getAuthToken();

        const res = await fetch(
          `${API_BASE_URL}/api/publicaciones/${publicacionId}/resumen-final`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();

        setData(json.data);
      } catch (err) {
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicacionId]);

  // ================= LOGICA =================
  const parametrosFinales = useMemo(() => {
    return data?.parametrosPersonalizados || parametrosExtra;
  }, [data, parametrosExtra]);

  const ejecutarPublicacion = async () => {
    isCancelled.current = false;
    isPaused.current = false;

    setEstadoPublicacion("publicando");
    setProgreso(0);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProgreso(50);

      await new Promise((r) => setTimeout(r, 500));
      setProgreso(100);

      setEstadoPublicacion("exito");
      setMostrarModalExito(true);
    } catch {
      setEstadoPublicacion("error_publicacion");
    }
  };

  const handleCancelar = () => {
    isCancelled.current = true;
    setEstadoPublicacion("idle");
    router.push("/");
  };

  const handlePausar = (p: boolean) => {
    isPaused.current = p;
  };

  const cerrarModalExito = () => setMostrarModalExito(false);
  const irAlHome = () => router.push("/");

  // ================= UI =================
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;

  return (
    <>
      <section className="mx-auto max-w-7xl bg-white p-6 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">
          Resumen de la propiedad
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <InfoPropiedad data={data} />
          <GaleriaResumen multimedia={data.multimedia} />
        </div>

        <div className="mt-6">
          <ParametrosPersonalizados parametros={parametrosFinales} />
        </div>

        <div className="mt-6">
          <AceptacionPublicacion
            aceptado={aceptado}
            setAceptado={setAceptado}
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button onClick={() => history.back()}>
            Volver
          </button>

          <button
            disabled={!aceptado}
            onClick={ejecutarPublicacion}
          >
            Confirmar
          </button>
        </div>
      </section>

      {/* Modal publicación */}
      {estadoPublicacion !== "idle" && (
        <PublicarModal
          estado={estadoPublicacion as any}
          progreso={progreso}
          onConfirmar={ejecutarPublicacion}
          onCancelar={handleCancelar}
          onReintentar={() =>
            setEstadoPublicacion("confirmando")
          }
          onPausar={handlePausar}
        />
      )}

      {/* Modal éxito */}
      {mostrarModalExito && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-10 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Publicado con éxito
            </h2>

            <button onClick={irAlHome}>
              Ir al inicio
            </button>

            <button onClick={cerrarModalExito}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}