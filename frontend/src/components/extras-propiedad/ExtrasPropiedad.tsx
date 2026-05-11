"use client";

import { useEffect, useMemo, useState } from "react";

type ParametroBackend = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

type Props = {
  valoresIniciales?: string[];
  catalogoParametros?: ParametroBackend[];
  onGuardar?: (parametros: string[]) => void;
  onCancelar?: () => void;
};

const MIN_CARACTERES = 3;
const MAX_CARACTERES = 60;

export default function ExtrasPropiedad({
  valoresIniciales = [],
  catalogoParametros = [],
  onGuardar,
  onCancelar,
}: Props) {
  const [mostrarPanel, setMostrarPanel] = useState(true);
  const [nuevoParametro, setNuevoParametro] = useState("");
  const [parametros, setParametros] = useState<string[]>(valoresIniciales);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setParametros(valoresIniciales);
  }, [valoresIniciales]);

  const sugerencias = useMemo(() => {
    const busqueda = nuevoParametro.trim().toLowerCase();

    if (!busqueda) return [];

    return catalogoParametros
      .filter((item) => item.nombre?.toLowerCase().includes(busqueda))
      .filter(
        (item) =>
          !parametros.some(
            (parametro, index) =>
              parametro.toLowerCase() === item.nombre.toLowerCase() &&
              index !== indiceEdicion
          )
      )
      .slice(0, 6);
  }, [catalogoParametros, nuevoParametro, parametros, indiceEdicion]);

  const limpiarFormulario = () => {
    setNuevoParametro("");
    setIndiceEdicion(null);
    setError("");
  };

  const cerrarPanel = () => {
    setMostrarPanel(false);
    limpiarFormulario();
    onCancelar?.();
  };

  const agregarOActualizarParametro = () => {
    const valor = nuevoParametro.trim();

    if (!valor) {
      setError("Debe ingresar un parámetro.");
      return;
    }

    if (valor.length < MIN_CARACTERES) {
      setError(`El parámetro debe tener al menos ${MIN_CARACTERES} caracteres.`);
      return;
    }

    if (valor.length > MAX_CARACTERES) {
      setError(`El parámetro no puede superar los ${MAX_CARACTERES} caracteres.`);
      return;
    }

    const repetido = parametros.some(
      (item, index) =>
        item.toLowerCase() === valor.toLowerCase() && index !== indiceEdicion
    );

    if (repetido) {
      setError("Ese parámetro ya fue añadido.");
      return;
    }

    if (indiceEdicion !== null) {
      const copia = [...parametros];
      copia[indiceEdicion] = valor;
      setParametros(copia);
    } else {
      setParametros([...parametros, valor]);
    }

    limpiarFormulario();
  };

  const seleccionarSugerencia = (nombre: string) => {
    setNuevoParametro(nombre);
    setError("");
  };

  const editarParametro = (index: number) => {
    setNuevoParametro(parametros[index]);
    setIndiceEdicion(index);
    setError("");
  };

  const eliminarParametro = (index: number) => {
    const actualizados = parametros.filter((_, i) => i !== index);
    setParametros(actualizados);

    if (indiceEdicion === index) {
      limpiarFormulario();
    }
  };

  const guardarParametros = () => {
    onGuardar?.(parametros);
    limpiarFormulario();
  };

  if (!mostrarPanel) return null;

 return (
  <div className="space-y-6 p-6">
    {/* TITULO */}
    <div>
      <h2 className="text-[46px] font-bold text-[#101828]">
        Tags o Etiquetas
      </h2>

      <p className="mt-4 max-w-4xl text-[22px] leading-9 text-[#667085]">
        Agrega palabras clave para que los clientes encuentren tu inmueble
        más fácilmente mediante búsquedas y filtros.
      </p>
    </div>

    {/* INPUT */}
    <div>
      <label className="mb-4 block text-[22px] font-semibold text-[#101828]">
        Nuevo tag
      </label>

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex-1">
          <input
            type="text"
            value={nuevoParametro}
            maxLength={MAX_CARACTERES}
            onChange={(e) => {
              setNuevoParametro(e.target.value);

              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarOActualizarParametro();
              }
            }}
            placeholder="Ej: piscina, garaje, terraza"
            className="h-[74px] w-full rounded-2xl border border-[#D0D5DD] bg-white px-6 text-[20px] outline-none transition focus:border-orange-400"
          />

          <p className="mt-4 text-[16px] text-[#667085]">
            Presiona Enter o haz clic en "Agregar" para añadir el tag.
          </p>
        </div>

        <button
          type="button"
          onClick={agregarOActualizarParametro}
          className="flex h-[74px] min-w-[210px] items-center justify-center gap-3 rounded-2xl bg-[#ff7a00] px-8 text-[24px] font-semibold text-white transition hover:bg-orange-600"
        >
          <span className="text-4xl">+</span>

          {indiceEdicion !== null ? "Actualizar" : "Agregar"}
        </button>
      </div>

      {error && (
        <p className="mt-5 text-base font-medium text-red-600">
          {error}
        </p>
      )}
    </div>

    {/* SUGERENCIAS */}
    <div>
      <h3 className="mb-5 text-[24px] font-bold text-[#101828]">
        Sugerencias
      </h3>

      <div className="flex flex-wrap gap-4">
        {[
          "piscina",
          "garaje",
          "terraza",
          "pet friendly",
          "amoblado",
          "vista panorámica",
          "seguridad 24/7",
          "jardín",
        ].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => seleccionarSugerencia(item)}
            className="rounded-full border border-[#D0D5DD] bg-white px-6 py-3 text-[18px] font-medium text-[#344054] transition hover:border-orange-400 hover:text-orange-500"
          >
            {item}
          </button>
        ))}
      </div>
    </div>

    {/* TAGS */}
    <div>
      <h3 className="mb-5 text-[28px] font-bold text-[#101828]">
        Tags añadidos ({parametros.length}/15)
      </h3>

      <div className="flex flex-wrap gap-4">
        {parametros.length === 0 ? (
          <p className="text-[18px] text-[#667085]">
            Aún no se añadieron tags.
          </p>
        ) : (
          parametros.map((parametro, index) => (
            <div
              key={`${parametro}-${index}`}
              className="flex items-center gap-3 rounded-full bg-black px-6 py-3 text-white"
            >
              <span className="text-[18px] font-medium">
                {parametro}
              </span>

              <button
                type="button"
                onClick={() => editarParametro(index)}
                className="text-orange-400"
              >
                ✎
              </button>

              <button
                type="button"
                onClick={() => eliminarParametro(index)}
                className="text-[24px] text-orange-400"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <p className="mt-5 text-[17px] text-[#667085]">
        Puedes agregar hasta 15 tags. Cada tag debe tener entre 3 y 30 caracteres.
      </p>
    </div>

    {/* PARAMETROS */}
    <div className="border-t border-[#EAECF0] pt-10">
      <h2 className="mb-3 text-[38px] font-bold text-[#101828]">
        Parámetros personalizados (opcionales)
      </h2>

      <p className="mb-6 text-[20px] text-[#667085]">
        Agrega características adicionales que hacen única tu propiedad.
      </p>

      <div className="flex flex-col gap-4 xl:flex-row">
        <input
          type="text"
          placeholder="Ej: balcón, terraza vista panorámica, baño privado"
          className="h-[74px] flex-1 rounded-2xl border border-[#D0D5DD] bg-white px-6 text-[20px] outline-none focus:border-orange-400"
        />

        <button
          type="button"
          className="flex h-[74px] min-w-[210px] items-center justify-center gap-3 rounded-2xl bg-[#ff7a00] px-8 text-[24px] font-semibold text-white hover:bg-orange-600"
        >
          <span className="text-4xl">+</span>
          Agregar
        </button>
      </div>

      {/* SUGERENCIAS */}
      <div className="mt-8 flex flex-wrap gap-4">
        {[
          "seguridad 24h",
          "ascensor",
          "baño privado",
          "aire acondicionado",
          "balcón",
          "terraza vista panorámica",
          "área de parrilla",
          "sistema de alarma",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-[#D0D5DD] bg-white px-6 py-3 text-[18px] font-medium text-[#344054]"
          >
            {item}
          </button>
        ))}
      </div>

      {/* PARAMETROS AÑADIDOS */}
      <div className="mt-8">
        <h3 className="mb-5 text-[28px] font-bold text-[#101828]">
          Parámetros añadidos ({parametros.length}/10)
        </h3>

        <div className="flex flex-wrap gap-4">
          {parametros.map((parametro, index) => (
            <div
              key={`${parametro}-${index}`}
              className="flex items-center gap-3 rounded-full bg-[#E76F51] px-6 py-3 text-white"
            >
              <span className="text-[18px] font-semibold">
                {parametro}
              </span>

              <button
                type="button"
                onClick={() => eliminarParametro(index)}
                className="text-[24px]"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[17px] text-[#667085]">
          Puedes agregar hasta 10 parámetros. Cada parámetro debe tener entre 3 y 60 caracteres.
        </p>
      </div>
    </div>

    {/* BOTONES */}
    <div className="flex justify-end gap-5 border-t border-[#EAECF0] pt-10">
      <button
        type="button"
        onClick={cerrarPanel}
        className="h-[60px] rounded-full bg-[#D0D5DD] px-12 text-[20px] font-medium text-[#344054]"
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={guardarParametros}
        className="h-[60px] rounded-full border border-[#D0D5DD] bg-white px-12 text-[20px] font-medium text-[#344054]"
      >
        Atrás
      </button>

      <button
        type="button"
        onClick={guardarParametros}
        className="h-[60px] rounded-full bg-[#ff7a00] px-14 text-[20px] font-semibold text-white hover:bg-orange-600"
      >
        Siguiente
      </button>
    </div>
  </div>
);
}