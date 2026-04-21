// frontend/src/components/busqueda/capacidad/CapacidadFilter.tsx
'use client'

interface CapacidadFilterProps {
  onClose: () => void
}

export function CapacidadFilter({ onClose }: CapacidadFilterProps) {
  return (
    // Asegurar que sea blanco y visible
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 w-80">
      {/* Cabecera con título y botón cerrar */}
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-orange-500"></span> Capacidad
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>

      {/* Contenido vacío por ahora */}
      <div className="text-sm text-gray-500 text-center py-8">
        Aquí irán los sliders de dormitorios y baños
      </div>
    </div>
  )
}
