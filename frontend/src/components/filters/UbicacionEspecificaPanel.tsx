import React from 'react';
import { ChevronLeft } from 'lucide-react'; 
import { useFiltrosGeograficos } from '@/hooks/useFiltrosGeograficos';

interface UbicacionEspecificaPanelProps {
  onClose: () => void;
}

export function UbicacionEspecificaPanel({ onClose }: UbicacionEspecificaPanelProps) {
  const { selecciones, listas, handlers, bloqueos } = useFiltrosGeograficos();

  return (
    <div className="w-full h-full bg-white flex flex-col animate-in slide-in-from-right-4 duration-300">
      
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button 
          onClick={onClose} 
          className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
          Ubicación Específica
        </h2>
      </div>

      {/* ── FORMULARIO EN CASCADA ── */}
      <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* 1. DEPARTAMENTO */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Departamento</label>
          <select
            value={selecciones.departamento}
            onChange={(e) => handlers.onDepartamentoChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            className="w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
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
            className="w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
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
            className="w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
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
            className="w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
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
            className="w-full p-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {listas.barrios.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>

      </div>

      {/* ── FOOTER / BOTONES ── */}
      <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
        <button 
          onClick={() => handlers.onDepartamentoChange('todos')}
          className="px-4 py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
        >
          Limpiar
        </button>
        <button 
          onClick={onClose} 
          className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/20"
        >
          Aplicar
        </button>
      </div>

    </div>
  );
}