"use client";

import { useParams } from "next/navigation";
import { Heart } from "lucide-react";
import { useDetallePropiedad } from "@/hooks/useDetallePropiedad";
import GaleriaPropiedad from "@/components/detalle-propiedad/GaleriaPropiedad";
import ResumenPropiedad from "@/components/detalle-propiedad/ResumenPropiedad";
import DescripcionPropiedad from "@/components/detalle-propiedad/DescripcionPropiedad";
import DetallesPropiedad from "@/components/detalle-propiedad/DetallesPropiedad";
import UbicacionPropiedad from "@/components/detalle-propiedad/UbicacionPropiedad";
import ContactoPropiedad from "@/components/detalle-propiedad/ContactoPropiedad";

export default function DetallePropiedadPage() {
  const params = useParams();
  const id = Number(params.id);
  const { detalle, loading, error } = useDetallePropiedad(id);

  if (loading) {
    return <div className="px-4 py-8">Cargando detalle de propiedad...</div>;
  }

  if (error) {
    return <div className="px-4 py-8 text-red-600">{error}</div>;
  }

  if (!detalle) {
    return <div className="px-4 py-8">No se encontró la propiedad.</div>;
  }

  return (
    <main className="min-h-screen bg-[#ede7dc]">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-[#d67a00]"
          >
            <Heart className="h-4 w-4" />
            Añadir a favoritos
          </button>
        </div>

        <GaleriaPropiedad imagenes={detalle.imagenes} titulo={detalle.titulo} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="space-y-5">
            <ResumenPropiedad detalle={detalle} />
            <DescripcionPropiedad descripcion={detalle.descripcion} />
            <DetallesPropiedad detalle={detalle} />
            <UbicacionPropiedad mapa={detalle.mapa} />
          </div>

          <div className="lg:sticky lg:top-16 lg:self-start">
            <ContactoPropiedad contacto={detalle.contacto} />
          </div>
        </div>
      </div>
    </main>
  );
}
