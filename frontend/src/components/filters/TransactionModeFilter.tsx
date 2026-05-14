'use client'

interface TransactionModeFilterProps {
  modoSeleccionado: string[]
  onModoChange: (modo: string[]) => void
}

export default function TransactionModeFilter({
  modoSeleccionado,
  onModoChange
}: TransactionModeFilterProps) {
  const modos = [
    { id: 'VENTA', label: 'Venta' },
    { id: 'ALQUILER', label: 'Alquiler' },
    { id: 'ANTICRETO', label: 'Anticrético' }
  ]
  return (
    <div className="flex gap-6">
      {modos.map((modo) => {
        const isSelected = modoSeleccionado.includes(modo.id);
        
        return (
          <label
            key={modo.id}
            // Añadimos textos adaptables al modo oscuro
            className="group flex items-center gap-2 text-sm text-stone-900 dark:text-slate-200 font-medium cursor-pointer"
          >
            <div className="relative inline-flex shadow-sm">
              <input
                type="checkbox"
                name="modoTransaccion"
                value={modo.id}
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    onModoChange(modoSeleccionado.filter((id) => id !== modo.id))
                  } else {
                    onModoChange([...modoSeleccionado, modo.id])
                  }
                }}
                className={`
                  w-[28px] h-[18px] rounded border cursor-pointer appearance-none transition-colors
                  group-hover:border-[#d97706] dark:group-hover:border-[#E87C1E]
                  ${
                    isSelected
                      ? 'bg-[#d97706] dark:bg-[#E87C1E] border-[#d97706] dark:border-[#E87C1E]'
                      : 'bg-white dark:bg-slate-800 border-gray-400 dark:border-slate-600'
                  }
                `}
              />
              {isSelected && (
                <svg
                  // Cambiamos el color según el modo (negro en claro, blanco en oscuro)
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none text-black dark:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              )}
            </div>
            {modo.label}
          </label>
        )
      })}
    </div>
  )
}