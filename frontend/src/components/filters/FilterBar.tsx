"use client"

import { useState } from "react"
import PropertyTypeVisual from "./PropertyTypeFilter"
import TransactionModeFilter from "./TransactionModeFilter"

interface FilterBarProps {
  onSearch: (filtros: { tipos: string[]; modo: string }) => void
}

export default function FilterBar({ onSearch }: FilterBarProps) {

  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([])
  const [modoSeleccionado, setModoSeleccionado] = useState<string>("VENTA")

  const handleTipoChange = (tipo: string) => {

    setTiposSeleccionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    )

  }

  const handleSearch = () => {

    onSearch({
      tipos: tiposSeleccionados,
      modo: modoSeleccionado
    })

  }

  return (
    <div className="bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px]">
      <TransactionModeFilter
        modoSeleccionado={modoSeleccionado}
        onModoChange={setModoSeleccionado}
      />
      <div className="flex items-end justify-between pr-4">
      <PropertyTypeVisual
        tiposSeleccionados={tiposSeleccionados}
        onTipoChange={handleTipoChange}
      />

      <button onClick={handleSearch}
      className="px-6 py-2 bg-[#d97706] text-white rounded-lg hover:bg-[#b95e00] transition-colors font-medium"
      >
        Buscar
      </button>
    </div>
    </div>
  )

}
