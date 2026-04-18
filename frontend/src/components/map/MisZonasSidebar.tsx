'use client'

import { X, Plus, Pencil, Trash2, Map as MapIcon } from 'lucide-react'

export interface ZonaPersonalizada {
  id: string
  nombre: string
}

interface MisZonasSidebarProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  zonas: ZonaPersonalizada[]
  onAddZone: () => void
  onEditZone: (id: string) => void
  onDeleteZone: (id: string) => void
}

// Asegúrate de que tenga "export default function"
export default function MisZonasSidebar({
  isOpen,
  onClose,
  isAuthenticated,
  zonas,
  onAddZone,
  onEditZone,
  onDeleteZone
}: MisZonasSidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[1050] md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-[1100] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-stone-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2 text-slate-800">
            <MapIcon className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-lg">Mis zonas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-500 gap-3">
              <MapIcon className="w-12 h-12 text-stone-300" />
              <p className="text-sm">
                Debes iniciar sesión para crear y guardar zonas de búsqueda personalizadas.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={onAddZone}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-50 text-orange-600 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors font-semibold text-sm"
              >
                <Plus size={18} />
                Añadir nueva Zona
              </button>

              {zonas.length === 0 ? (
                <div className="text-center text-sm text-stone-400 mt-10">
                  No tienes zonas guardadas.
                </div>
              ) : (
                <ul className="flex flex-col gap-2 mt-2">
                  {zonas.map((zona) => (
                    <li
                      key={zona.id}
                      className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-orange-200 transition-colors group"
                    >
                      <span className="text-sm font-medium text-stone-700 truncate pr-2">
                        {zona.nombre}
                      </span>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditZone(zona.id)}
                          className="p-1.5 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                          title="Editar zona"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteZone(zona.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar zona"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}