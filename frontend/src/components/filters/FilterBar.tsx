// frontend/src/components/filters/FilterBar.tsx
"use client";

import PropertyTypeVisual from "./PropertyTypeFilter";
import TransactionModeFilter from "./TransactionModeFilter";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";

interface FilterBarProps {
  onFiltersChange?: () => void;
}

export default function FilterBar({ onFiltersChange }: FilterBarProps) {
  const {
    tiposSeleccionados,
    modoSeleccionado,
    handleTipoChange,
    handleModoChange,
    resetFilters
  } = usePropertyFilters();

  const notifyChange = () => {
    if (onFiltersChange) {
      onFiltersChange();
    }
  };

  const handleTipoChangeWithNotify = (tipo: string) => {
    handleTipoChange(tipo as any);
    setTimeout(notifyChange, 0);
  };

  const handleModoChangeWithNotify = (modo: string) => {
    handleModoChange(modo as any);
    setTimeout(notifyChange, 0);
  };

  return (
    <div className="bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px] h-[159px]">
      {/* Modo de transacción - ahora recibe props */}
      <TransactionModeFilter
        modoSeleccionado={modoSeleccionado}
        onModoChange={handleModoChangeWithNotify}
      />

      <div className="flex items-center gap-16">
        {/* Tipo de inmueble - ahora recibe props */}
        <PropertyTypeVisual
          tiposSeleccionados={tiposSeleccionados}
          onTipoChange={handleTipoChangeWithNotify}
        />
        
        {/* Aquí irán otros filtros como zona, etc. */}
      </div>
      

    </div>
  );
}