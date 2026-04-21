"use client";

import PublicacionCard from "@/components/publicacion/PublicacionCard";
import { useMisPublicaciones } from "@/hooks/useMisPublicaciones";
import { useRouter } from "next/navigation";

export default function MisPublicacionesPage() {
  const router = useRouter();

  const { publicaciones, loading, error, removerPublicacionDeLista } =
    useMisPublicaciones();

  // Filtrar publicaciones activas
  const publicacionesActivas = publicaciones.filter(
    (p) => p.estado === "ACTIVA"
  );

  const limiteGratis = 2;
  const puedePublicarGratis = publicacionesActivas.length < limiteGratis;

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        Cargando publicaciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-red-600 sm:px-6 lg:px-8">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      
      <h1 className="mb-6 text-3xl font-bold text-black sm:mb-8">
        Mis publicaciones
      </h1>

      {/* PANEL SUPERIOR */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        
        {/* INFO PLAN */}
        <div>
          <p className="text-sm text-gray-500">Mi Plan actual:</p>
          <p className="font-semibold text-black">
            Básico (Gratis)
          </p>

          <p className="text-sm text-gray-600">
            Publicaciones Activas:{" "}
            <span className="font-medium">
              {publicacionesActivas.length} / {limiteGratis}
            </span>
          </p>
        </div>

        {/* BOTÓN CREAR */}
        <div className="text-right">
          <button
            disabled={!puedePublicarGratis}
            onClick={() => router.push("/crear-publicacion")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              puedePublicarGratis
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "cursor-not-allowed bg-gray-300 text-gray-600"
            }`}
          >
            Crear Nueva Publicación
          </button>

          {!puedePublicarGratis && (
            <p className="mt-1 text-xs text-gray-500">
              Límite alcanzado: Actualiza tu plan para añadir más propiedades.
            </p>
          )}
        </div>
      </div>

      {/* LISTADO */}
      {publicaciones.length === 0 ? (
        <p>No tienes publicaciones activas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {publicaciones.map((publicacion) => (
            <div
              key={publicacion.id}
              className="mx-auto w-full max-w-[360px] sm:max-w-none"
            >
              <PublicacionCard
                publicacion={publicacion}
                onDeleted={removerPublicacionDeLista}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

