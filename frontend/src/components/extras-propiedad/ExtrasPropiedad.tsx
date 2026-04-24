"use client";

import { useEffect, useState } from "react";

type Props = {
  valoresIniciales?: string[];
  onGuardar?: (parametros: string[]) => void;
  onCancelar?: () => void;
};

export default function ExtrasPropiedad({
  valoresIniciales = [],
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

    const repetido = parametros.some(
      (item, index) =>
        item.toLowerCase() === valor.toLowerCase() && index !== indiceEdicion,
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
    <div className="mt-4 rounded-2xl border border-neutral-300 bg-[#f5ede2] p-6">
      <h3 className="mb-4 text-xl font-bold text-neutral-900">
        Añadir parámetros personalizados
      </h3>

      <label className="mb-2 block text-sm font-semibold text-neutral-800">
        Nuevo parámetro:
      </label>

      <div className="mb-3 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={nuevoParametro}
          onChange={(e) => {
            setNuevoParametro(e.target.value);
            if (error) setError("");
          }}
          placeholder="Ej: balcón, terraza, vista panorámica..."
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-orange-400"
        />

        <button
          type="button"
          onClick={agregarOActualizarParametro}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          {indiceEdicion !== null ? "Actualizar" : "+ Agregar"}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
      )}

      <h4 className="mb-3 text-base font-semibold text-neutral-900">
        Parámetros añadidos:
      </h4>

      <div className="mb-6 flex flex-wrap gap-3">
        {parametros.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Aún no se añadieron parámetros.
          </p>
        ) : (
          parametros.map((parametro, index) => (
            <div
              key={`${parametro}-${index}`}
              className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white"
            >
              <span>{parametro}</span>

              <button
                type="button"
                onClick={() => editarParametro(index)}
                className="text-orange-400"
                title="Editar"
              >
                ✎
              </button>

              <button
                type="button"
                onClick={() => eliminarParametro(index)}
                className="text-orange-400"
                title="Eliminar"
              >
                ✖
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center gap-6 border-t border-neutral-400 pt-6">
        <button
          type="button"
          onClick={cerrarPanel}
          className="rounded-full bg-gray-300 px-8 py-2 font-medium text-neutral-800"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={guardarParametros}
          className="rounded-full bg-orange-500 px-8 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
