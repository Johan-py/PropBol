"use client";

import { useState } from "react";
import InfoPropiedad from "./InfoPropiedad";
import GaleriaResumen from "./GaleriaResumen";
import AceptacionPublicacion from "./AceptacionPublicacion";

export interface DatosPropiedad {
  titulo?: string;
  tipoOperacion?: string;
  tipoInmueble?: string;
  precio?: string;
  areaTotal?: string;
  habitaciones?: string;
  banos?: string;
  direccion?: string;
  zona?: string;
  descripcion?: string;
}

export interface VideoItem {
  titulo: string;
  tipo: string;
}

export default function ResumenPanel() {
  const [aceptado, setAceptado] = useState(false);

  // Aquí luego reemplazarás estos datos por los reales del formulario
  const datosPropiedad: DatosPropiedad = {
    titulo: "",
    tipoOperacion: "",
    tipoInmueble: "",
    precio: "",
    areaTotal: "",
    habitaciones: "",
    banos: "",
    direccion: "",
    zona: "",
    descripcion: "",
  };

  // Aquí luego pondrás las fotos reales
  const imagenes: string[] = [];

  // Aquí luego pondrás los videos reales
  const videos: VideoItem[] = [];

  return (
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InfoPropiedad datos={datosPropiedad} />
          <GaleriaResumen imagenes={imagenes} videos={videos} />
        </div>

        <div className="my-8 border-t border-gray-200" />

        <div className="mb-8">
          <AceptacionPublicacion
            aceptado={aceptado}
            setAceptado={setAceptado}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button className="rounded-xl border border-gray-400 bg-white px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-gray-50">
            Volver
          </button>

          <button
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
  );
}
