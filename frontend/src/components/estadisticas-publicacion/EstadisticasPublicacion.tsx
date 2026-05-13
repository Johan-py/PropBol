"use client";

import { Eye, Share2 } from "lucide-react";

type EstadisticasPublicacionProps = {
  visualizaciones?: number;
  compartidos?: number;
};

export default function EstadisticasPublicacion({
  visualizaciones = 0,
  compartidos = 0,
}: EstadisticasPublicacionProps) {
  return (
    <div className="flex items-center gap-8 mt-3">
      <div className="flex flex-col items-center text-gray-700">
        <Eye size={24} className="text-black" />
        <span className="text-xs mt-1">Visualizaciones</span>
        <strong className="text-sm">{visualizaciones}</strong>
      </div>

      <div className="flex flex-col items-center text-gray-700">
        <Share2 size={24} className="text-black" />
        <span className="text-xs mt-1">Compartidos</span>
        <strong className="text-sm">{compartidos}</strong>
      </div>
    </div>
  );
}