import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useFiltrosGeograficos } from '@/hooks/useFiltrosGeograficos';
import { X } from 'lucide-react';

interface UbicacionEspecificaPanelProps {
  onClose: () => void;
  onApply: (selecciones: any) => void;
}

export function UbicacionEspecificaPanel({ onClose, onApply }: UbicacionEspecificaPanelProps) {
  const { selecciones, listas, handlers, bloqueos } = useFiltrosGeograficos();

  // Clase unificada para todos los selects
  const selectClasses = "w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer";

  return (
    <div className="flex flex-col h-full min-h-0 bg-white w-full animate-in slide-in-from-right-4 duration-300">
      {/* 1. HEADER (Fijo) */}
      <div className="shrink-0 p-4 pb-2 relative flex flex-col items-center justify-center border-b border-gray-100">
        <div className="w-full flex items-center justify-center relative mb-1">
          <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
            Ubicación Específica
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-2 text-center">Seleccione la ubicación:</p>
      </div>

      {/* 2. CONTENIDO (Con Scroll) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
        {/* 1. DEPARTAMENTO */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Departamento</label>
          <select
            value={selecciones.departamento}
            onChange={(e) => handlers.onDepartamentoChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            className={selectClasses}
          >
            {listas.departamentos.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>

        {/* 2. PROVINCIA */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Provincia</label>
          <select
            value={selecciones.provincia}
            onChange={(e) => handlers.onProvinciaChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={bloqueos.provinciaDisabled}
            className={selectClasses}
          >
            {listas.provincias.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>

        {/* 3. MUNICIPIO */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Municipio</label>
          <select
            value={selecciones.municipio}
            onChange={(e) => handlers.onMunicipioChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={bloqueos.municipioDisabled}
            className={selectClasses}
          >
            {listas.municipios.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>

        {/* 4. ZONA */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Zona</label>
          <select
            value={selecciones.zona}
            onChange={(e) => handlers.onZonaChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={bloqueos.zonaDisabled}
            className={selectClasses}
          >
            {listas.zonas.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>

        {/* 5. BARRIO */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Distrito o Barrio</label>
          <select
            value={selecciones.barrio}
            onChange={(e) => handlers.onBarrioChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            disabled={bloqueos.barrioDisabled}
            className={selectClasses}
          >
            {listas.barrios.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. FOOTER (Fijo al fondo) */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white">
        <button
           type="button"
           onClick={() => handlers.onDepartamentoChange('todos')}
           className="text-xs text-stone-400 hover:text-[#d97706] transition-colors underline text-center w-full mb-3"
        >
          Limpiar filtro
        </button>
        <button
          onClick={() => onApply(selecciones)}
          className="bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}