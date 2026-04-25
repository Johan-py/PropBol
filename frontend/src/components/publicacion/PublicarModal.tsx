"use client";

import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

interface Props {
  onConfirmar: () => void;
  onCancelar: () => void;
  estado: "confirmando" | "publicando" | "exito" | "error_publicacion";
  progreso: number;
  onReintentar: () => void;
}

export default function PublicarModal({
  onConfirmar,
  onCancelar,
  estado,
  progreso,
  onReintentar,
}: Props) {
  const [checked, setChecked] = useState(false);

  const estaPublicando = estado === "publicando";
  const esExito = estado === "exito";
  const esError = estado === "error_publicacion";

  // Advertencia al intentar cerrar la pestaña mientras publica
  useEffect(() => {
    if (!estaPublicando) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [estaPublicando]);

  const handleCancelar = () => {
    if (estaPublicando) {
      const confirmar = window.confirm(
        "¿Desea cancelar la publicación en curso?"
      );
      if (!confirmar) return;
    }
    onCancelar();
  };

  return (
    // Overlay oscuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-800">Publicar inmueble</h2>
        <p className="mb-5 text-sm text-gray-400">
          Confirma los datos y completa la publicación
        </p>

        {/* Checkbox de confirmación */}
        <label className="mb-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={estaPublicando || esExito}
            className="mt-0.5 h-4 w-4 accent-orange-500"
          />
          <span className="text-sm text-gray-700">
            Confirme que la información es correcta y deseo publicar
            <br />
            <span className="text-xs text-gray-400">
              Nota: Puedes publicar hasta 2 inmuebles de forma gratuita.
            </span>
          </span>
        </label>

        {/* Barra de progreso (siempre visible) */}
        <div className="mb-5">
          <ProgressBar progreso={progreso} />
        </div>

        {/* Mensaje de éxito */}
        {esExito && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            ✅ ¡Inmueble publicado exitosamente!
          </div>
        )}

        {/* Mensaje de error */}
        {esError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            ❌ Ocurrió un error al publicar. Tus datos no se perdieron.
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          {/* Cancelar */}
          {!esExito && (
            <button
              onClick={handleCancelar}
              disabled={false}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm
                         font-medium text-gray-600 transition hover:bg-gray-50
                         disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          {/* Publicar / Reintentar / Cerrar */}
          {esError ? (
            <button
              onClick={onReintentar}
              className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm
                         font-semibold text-white transition hover:bg-orange-600"
            >
              Reintentar
            </button>
          ) : esExito ? (
            <button
              onClick={onCancelar}
              className="w-full rounded-lg bg-green-500 py-2.5 text-sm
                         font-semibold text-white transition hover:bg-green-600"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={onConfirmar}
              disabled={!checked || estaPublicando}
              className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm
                         font-semibold text-white transition hover:bg-orange-600
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {estaPublicando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Publicando...
                </span>
              ) : (
                "Publicar inmueble"
              )}
            </button>
          )}
        </div>

        {/* Aviso inferior */}
        {estaPublicando && (
          <p className="mt-3 text-center text-xs text-gray-400">
            No cierres esta ventana durante la publicación
          </p>
        )}
      </div>
    </div>
  );
}