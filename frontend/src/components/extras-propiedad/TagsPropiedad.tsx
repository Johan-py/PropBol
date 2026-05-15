"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: number;
  nombre: string;
};

type Props = {
  publicacionId: number;
  tagsIniciales?: string[];
  catalogoTags?: Tag[];
  onGuardar?: (tags: string[]) => void;
};

const MIN_CARACTERES = 3;
const MAX_CARACTERES = 30;
const MAX_TAGS = 15;

const SUGERENCIAS_DEFAULT = [
  "piscina", "garaje", "terraza", "pet friendly",
  "amoblado", "vista panorámica", "seguridad 24/7", "jardín",
];

export default function TagsPropiedad({
  tagsIniciales = [],
  catalogoTags = [],
  onGuardar,
}: Props) {
  const [tags, setTags] = useState<string[]>(tagsIniciales);
  const [nuevoTag, setNuevoTag] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<Tag[]>([]);

    useEffect(() => {
    if (tagsIniciales.length > 0) {
        setTags(tagsIniciales);
    }
    }, []);

  useEffect(() => {
    const busqueda = nuevoTag.trim().toLowerCase();
    if (!busqueda) {
      setSugerenciasFiltradas([]);
      return;
    }
    const filtradas = catalogoTags
      .filter((t) => t.nombre.toLowerCase().includes(busqueda))
      .filter((t) => !tags.some((tag) => tag.toLowerCase() === t.nombre.toLowerCase()))
      .slice(0, 6);
    setSugerenciasFiltradas(filtradas);
  }, [nuevoTag, catalogoTags, tags]);

  const agregarTag = (nombre: string) => {
    const valor = nombre.trim();

    if (!valor) return;

    if (valor.length < MIN_CARACTERES || valor.length > MAX_CARACTERES) {
      setError(`El tag debe tener entre ${MIN_CARACTERES} y ${MAX_CARACTERES} caracteres`);
      return;
    }

    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s\-]+$/.test(valor)) {
      setError("El tag contiene caracteres no permitidos");
      return;
    }

    if (tags.some((t) => t.toLowerCase() === valor.toLowerCase())) {
      setError("Este tag ya fue agregado");
      return;
    }

    if (tags.length >= MAX_TAGS) {
      setError(`No puedes agregar más de ${MAX_TAGS} tags`);
      return;
    }

    const nuevos =  [...new Set([...tags, valor])];
    setTags(nuevos);
    setNuevoTag("");
    setError("");
    setMensajeExito("¡Excelente! El tag fue agregado.");
    //onGuardar?.(nuevos);

    setTimeout(() => setMensajeExito(""), 2000);
  };

  const eliminarTag = (index: number) => {
    const actualizados = tags.filter((_, i) => i !== index);
    setTags(actualizados);
    setError("");
    setMensajeExito("");
    //onGuardar?.(actualizados);
  };

  return (
    <div className="space-y-6">
      {/* TITULO */}
      <div>
        <h2 className="text-[36px] font-bold text-[#101828]">
          Tags o Etiquetas
        </h2>
        <p className="mt-2 text-[18px] text-[#667085]">
          Agrega palabras clave para que los clientes encuentren tu inmueble
          más fácilmente. Presiona Enter o haz clic en "Agregar".
        </p>
      </div>

      {/* INPUT */}
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex-1">
          <input
            type="text"
            value={nuevoTag}
            maxLength={MAX_CARACTERES}
            onChange={(e) => {
              setNuevoTag(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarTag(nuevoTag);
              }
            }}
            placeholder="Ej: piscina, garaje, terraza"
            className="h-[60px] w-full rounded-2xl border border-[#D0D5DD] bg-white px-6 text-[18px] outline-none transition focus:border-orange-400"
          />

          {/* SUGERENCIAS DINÁMICAS */}
          {sugerenciasFiltradas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sugerenciasFiltradas.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => agregarTag(t.nombre)}
                  className="rounded-full border border-orange-300 bg-orange-50 px-4 py-1 text-[15px] text-orange-600 hover:bg-orange-100"
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          )}

          {sugerenciasFiltradas.length === 0 && nuevoTag.trim().length >= 2 && (
            <p className="mt-2 text-[14px] text-[#667085]">Sin sugerencias</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => agregarTag(nuevoTag)}
          disabled={tags.length >= MAX_TAGS}
          className="flex h-[60px] min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-[#ff7a00] px-6 text-[18px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          <span className="text-2xl">+</span> Agregar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      {/* ÉXITO */}
      {mensajeExito && (
        <p className="text-sm font-medium text-green-600">{mensajeExito}</p>
      )}

      {/* SUGERENCIAS PREDEFINIDAS */}
      <div>
        <h3 className="mb-3 text-[18px] font-semibold text-[#101828]">
          Sugerencias
        </h3>
        <div className="flex flex-wrap gap-3">
          {SUGERENCIAS_DEFAULT.filter(
            (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => agregarTag(item)}
              className="rounded-full border border-[#D0D5DD] bg-white px-5 py-2 text-[16px] font-medium text-[#344054] transition hover:border-orange-400 hover:text-orange-500"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* TAGS AÑADIDOS */}
      <div>
        <h3 className="mb-3 text-[20px] font-bold text-[#101828]">
          Tags añadidos ({tags.length}/{MAX_TAGS})
        </h3>

        {tags.length === 0 ? (
          <p className="text-[16px] text-[#667085]">Aún no se añadieron tags.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, index) => (
              <div
                key={`${tag}-${index}`}
                className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-white"
              >
                <span className="text-[16px] font-medium">{tag}</span>
                <button
                  type="button"
                  onClick={() => eliminarTag(index)}
                  className="text-[20px] text-orange-400 hover:text-orange-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-[14px] text-[#667085]">
          Puedes agregar hasta {MAX_TAGS} tags. Cada tag debe tener entre {MIN_CARACTERES} y {MAX_CARACTERES} caracteres.
        </p>
          {/* BOTÓN GUARDAR */}
            <div className="flex justify-end pt-4">
                <button
                type="button"
                disabled={tags.length === 0}
                onClick={() => onGuardar?.(tags)}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                Guardar tags
                </button>
            </div>
        </div>
      </div>
  );
}