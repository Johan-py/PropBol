"use client";

import ConfirmDeleteModal from "@/components/publicacion/ConfirmDeleteModal";
import DeleteSuccessModal from "@/components/publicacion/DeleteSuccessModal";
import DeleteErrorModal from "@/components/publicacion/DeleteErrorModal";
import { useDeletePublicacion } from "@/hooks/useDeletePublicacion";

export default function PruebasEliminarPublicacionPage() {
  const {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    modalErrorAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    cerrarError,
    confirmarEliminacion,
  } = useDeletePublicacion(1); // cambia por un id activo para probar(luego reemplazas por id real)

  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Prueba del modal</h1>

      <button
        onClick={abrirConfirmacion}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
      >
        Eliminar publicación
      </button>

      <ConfirmDeleteModal
        abierto={modalConfirmacionAbierto}
        onAceptar={confirmarEliminacion}
        onCancelar={cerrarConfirmacion}
        loading={loading}
      />

      <DeleteSuccessModal
        abierto={modalExitoAbierto}
        onAceptar={cerrarExito}
      />

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || "No se puede eliminar la publicación, intente nuevamente"}
        onAceptar={cerrarError}
      />
    </div>
  );
}