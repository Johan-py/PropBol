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
      {modos.map((modo) => (
        <label
          key={modo.id}
          // Añadimos 'group' aquí para detectar el hover general
          className="group flex items-center gap-2 text-sm text-stone-900 font-medium cursor-pointer"
        >
          <div className="relative inline-flex shadow-sm">
            <input
              type="checkbox"
              name="modoTransaccion"
              value={modo.id}
              checked={modoSeleccionado.includes(modo.id)}
              onChange={() => {
                if (modoSeleccionado.includes(modo.id)) {
                  onModoChange(modoSeleccionado.filter((id) => id !== modo.id))
                } else {
                  onModoChange([...modoSeleccionado, modo.id])
                }
              }}
              className={`
                w-[28px] h-[18px] rounded border cursor-pointer appearance-none transition-colors
                group-hover:border-[#d97706] /* 🚀 Borde naranja al pasar el mouse por encima */
                ${
                  modoSeleccionado.includes(modo.id)
                    ? 'bg-[#d97706] border-[#d97706]'
                    : 'bg-white border-gray-400'
                }
              `}
            />
            {modoSeleccionado.includes(modo.id) && (
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
          {modo.label}
        </label>
      ))}
    </div>
  )
}