// src/app/admin/planes/page.tsx

"use client";

import TablaPlanesActivos from "@/components/planes/TablaPlanesActivos";
import TablaPlanesEliminados from "@/components/planes/TablaPlanesEliminados";

export default function PaginaAdminPlanes() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Administración de Planes
          </h1>

          <p className="text-gray-500 mt-1">
            Gestiona los planes de publicación
          </p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition">
          Crear Plan
        </button>
      </div>

      <TablaPlanesActivos />

      <TablaPlanesEliminados />
    </div>
  );
}