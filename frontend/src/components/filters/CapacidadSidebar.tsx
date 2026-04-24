"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RangeSliderControl } from "../busqueda/capacidad/RangeSliderControl";

type TipoBano = "cualquiera" | "privado" | "compartido";

interface CapacidadSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (
    dormitoriosMin: number,
    dormitoriosMax: number,
    banosMin: number,
    banosMax: number,
    tipoBano: TipoBano,
  ) => void;
}

export function CapacidadSidebar({
  isOpen,
  onClose,
  onApply,
}: CapacidadSidebarProps) {
  const [dormitoriosMin, setDormitoriosMin] = useState(1);
  const [dormitoriosMax, setDormitoriosMax] = useState(10);
  const [banosMin, setBanosMin] = useState(1);
  const [banosMax, setBanosMax] = useState(8);
  const [tipoBano, setTipoBano] = useState<TipoBano>("cualquiera");

  if (!isOpen) return null;

  const handleApply = () => {
    if (onApply) {
      onApply(dormitoriosMin, dormitoriosMax, banosMin, banosMax, tipoBano);
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="p-4 relative flex items-center justify-center shrink-0">
        <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
          CAPACIDAD
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} className="text-stone-400" />
        </button>
      </div>

      {/* Texto descriptivo */}
      <div className="px-4 pt-0 pb-2">
        <p className="text-sm text-gray-700 text-center">
          Selecciona el rango de dormitorios y baños deseados
        </p>
      </div>

      {/* DORMITORIOS */}
      <div className="px-6 pt-5 space-y-6 mb-16">
        <RangeSliderControl
          label="dormitorios"
          minValue={dormitoriosMin}
          maxValue={dormitoriosMax}
          absoluteMin={1}
          absoluteMax={10}
          onMinChange={setDormitoriosMin}
          onMaxChange={setDormitoriosMax}
          unit="+"
        />

        {/* BAÑOS - Primero el selector de tipo */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className=" mb-1 font-bold text-xs text-black uppercase tracking-wide flex items-center gap-2">
              BAÑOS
            </span>
          </div>

          {/* Selector de tipo de baño */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-600 mb-4">
              Tipo de baño:
            </p>
            <div className="flex gap-10">
              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === "cualquiera"}
                    onChange={() => setTipoBano("cualquiera")}
                    className={`
                      w-[28px] h-[18px] rounded border cursor-pointer appearance-none
                      ${
                        tipoBano === "cualquiera"
                          ? "bg-[#d97706] border-[#d97706]"
                          : "bg-white border-gray-400"
                      }
                    `}
                  />
                  {tipoBano === "cualquiera" && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="3"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Cualquiera</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === "privado"}
                    onChange={() => setTipoBano("privado")}
                    className={`
                      w-[28px] h-[18px] rounded border cursor-pointer appearance-none
                      ${
                        tipoBano === "privado"
                          ? "bg-[#d97706] border-[#d97706]"
                          : "bg-white border-gray-400"
                      }
                    `}
                  />
                  {tipoBano === "privado" && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="3"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Privado</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === "compartido"}
                    onChange={() => setTipoBano("compartido")}
                    className={`
                      w-[28px] h-[18px] rounded border cursor-pointer appearance-none
                      ${
                        tipoBano === "compartido"
                          ? "bg-[#d97706] border-[#d97706]"
                          : "bg-white border-gray-400"
                      }
                    `}
                  />
                  {tipoBano === "compartido" && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="3"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Compartido</span>
              </label>
            </div>
          </div>

          {/* Sliders de cantidad de baños */}
          <div className="space-y-3 pt-7 border-t border-gray-400 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 w-8">Min</span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={banosMin}
                onChange={(e) => setBanosMin(Number(e.target.value))}
                className="flex-1 accent-[#d97706] h-2 rounded-lg"
              />
              <span className="text-xs text-stone-600 w-16 text-right">
                {banosMin}+
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 w-8">Máx</span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={banosMax}
                onChange={(e) => setBanosMax(Number(e.target.value))}
                className="flex-1 accent-[#d97706] h-2 rounded-lg"
              />
              <span className="text-xs text-stone-600 w-16 text-right">
                {banosMax}+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Aplicar */}
      <div className="px-4 pb-4 mt-4">
        <button
          onClick={handleApply}
          className="w-full py-2 text-white bg-[#d97706] rounded-lg hover:bg-[#b95e00] transition-colors font-medium"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
