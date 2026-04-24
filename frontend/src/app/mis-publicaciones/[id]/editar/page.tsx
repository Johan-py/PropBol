"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  editarPublicacion,
  obtenerDetallePublicacion,
} from "@/services/publicacion.service";
import type { EditarPublicacionPayload } from "@/types/publicacion";

type FormState = {
  titulo: string;
  descripcion: string;
  precio: string;
  tipoAccion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacion: string;
};

export default function EditarPublicacionPage() {
  const params = useParams();
  const router = useRouter();

  const publicacionId = Number(params.id);

  const [form, setForm] = useState<FormState>({
    titulo: "",
    descripcion: "",
    precio: "",
    tipoAccion: "VENTA",
    ubicacion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setLoading(true);
        setError("");

        const detalle = await obtenerDetallePublicacion(publicacionId);

        setForm({
          titulo: detalle.titulo ?? "",
          descripcion: detalle.descripcion ?? "",
          precio: detalle.precio ? String(detalle.precio) : "",
          tipoAccion: detalle.tipoOperacion ?? "VENTA",
          ubicacion: detalle.ubicacionTexto ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la publicación",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(publicacionId) && publicacionId > 0) {
      void cargarDetalle();
    } else {
      setLoading(false);
      setError("El id de la publicación es inválido");
    }
  }, [publicacionId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: EditarPublicacionPayload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        tipoAccion: form.tipoAccion,
        ubicacion: form.ubicacion.trim(),
      };

      await editarPublicacion(publicacionId, payload);

      setSuccess("Publicación actualizada correctamente");

      setTimeout(() => {
        router.push("/mis-publicaciones");
        router.refresh();
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la publicación",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-8">Cargando datos de la publicación...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-black">Editar publicación</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[#e6ddd1] bg-[#F9F6EE] p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Título
          </label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Tipo de operación
          </label>
          <select
            name="tipoAccion"
            value={form.tipoAccion}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
          >
            <option value="VENTA">VENTA</option>
            <option value="ALQUILER">ALQUILER</option>
            <option value="ANTICRETO">ANTICRETO</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Ubicación
          </label>
          <input
            type="text"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Precio
          </label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            min="1"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#D97706]"
            required
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/mis-publicaciones")}
            className="h-11 flex-1 rounded-lg border border-[#9a9a9a] bg-white text-[14px] font-medium text-[#2c2c2c] transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-11 flex-1 rounded-lg bg-[#D97706] text-[14px] font-medium text-white transition hover:bg-[#bf6905] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
