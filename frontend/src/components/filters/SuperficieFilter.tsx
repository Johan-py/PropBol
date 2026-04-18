"use client";

import { Maximize, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SuperficieFilterProps {
  onCambio?: (min: string, max: string) => void;
}

export default function SuperficieFilter({ onCambio }: SuperficieFilterProps) {
  const [abierto, setAbierto] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // Si se sale por la derecha, alinear a la derecha del botón
      const panelWidth = 200;
      const leftPos = rect.left + panelWidth > window.innerWidth
        ? rect.right - panelWidth
        : rect.left;
      setPanelPos({ top: rect.bottom + 6, left: leftPos });
    }
  }, [abierto]);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const tieneValores = desde !== "" || hasta !== "";

  return (
    <div className="relative shrink-0">

      {/* ── Botón — mismo estilo que los otros filtros ── */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`h-[36px] flex items-center gap-2 px-3 rounded-xl shadow-sm transition-all text-sm whitespace-nowrap focus:outline-none border
          ${tieneValores
            ? "bg-amber-600 text-white border-amber-600"
            : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
          }`}
      >
        <Maximize className={`w-4 h-4 ${tieneValores ? "text-white" : "text-stone-500"}`} />
        <span>Metros</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""} ${tieneValores ? "text-white" : "text-stone-400"}`} />
      </button>

      {/* ── Panel ── */}
      {abierto && (
        <div
          ref={panelRef}
          style={{ top: panelPos.top, left: panelPos.left }}
          className="fixed z-[9999] bg-white border-2 border-amber-500 rounded-2xl shadow-xl p-4 w-[200px]"
        >
          <p className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-0.5">
            Filtrar por Superficie
          </p>
          <p className="text-xs text-stone-400 mb-3">
            Ingrese el MIN Y MAX:
          </p>

          {/* Desde */}
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-stone-600 w-10 shrink-0">Desde:</label>
            <input
              type="number"
              placeholder="50"
              value={desde}
              min={0}
              onChange={(e) => { setDesde(e.target.value); onCambio?.(e.target.value, hasta); }}
              className="w-full border border-stone-300 rounded-lg px-2 py-1 text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Hasta */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-xs text-stone-600 w-10 shrink-0">Hasta:</label>
            <input
              type="number"
              placeholder="200"
              value={hasta}
              min={0}
              onChange={(e) => { setHasta(e.target.value); onCambio?.(desde, e.target.value); }}
              className="w-full border border-stone-300 rounded-lg px-2 py-1 text-sm text-stone-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Aplicar */}
          <button
            type="button"
            onClick={() => { onCambio?.(desde, hasta); setAbierto(false); }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold py-1.5 rounded-xl transition-all active:scale-95"
          >
            Aplicar
          </button>

          {/* Limpiar */}
          {tieneValores && (
            <button
              type="button"
              onClick={() => { setDesde(""); setHasta(""); onCambio?.("", ""); }}
              className="mt-2 w-full text-xs text-stone-400 hover:text-amber-600 transition-colors"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
}