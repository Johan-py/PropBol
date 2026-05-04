'use client'

import { ChevronRight, Plus, Pencil, Trash2, Check, X, Map as MapIcon } from 'lucide-react'

export interface ZonaPersonalizada {
  id: string
  usuarioId?: number
  nombre: string
}

interface MisZonasSidebarProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  zonas: ZonaPersonalizada[]
  editingZoneId?: string | null
  editingZoneName?: string
  isSavingEditZone?: boolean
  onEditingZoneNameChange?: (name: string) => void
  onConfirmEditZone?: () => void
  onCancelEditZone?: () => void
  draftZoneName?: string
  isDraftZoneVisible?: boolean
  isSavingDraftZone?: boolean
  onDraftZoneNameChange?: (name: string) => void
  onConfirmDraftZone?: () => void
  onCancelDraftZone?: () => void
  onAddZone: () => void
  onEditZone: (id: string) => void
  onDeleteZone: (id: string) => void
  currentUserId?: number
  onZoneSelect?: (id: number) => void
}

// Asegúrate de que tenga "export default function"
export default function MisZonasSidebar({
  isOpen,
  onClose,
  isAuthenticated,
  zonas,
  editingZoneId = null,
  editingZoneName = '',
  isSavingEditZone = false,
  onEditingZoneNameChange,
  onConfirmEditZone,
  onCancelEditZone,
  draftZoneName = '',
  isDraftZoneVisible = false,
  isSavingDraftZone = false,
  onDraftZoneNameChange,
  onConfirmDraftZone,
  onCancelDraftZone,
  onAddZone,
  onEditZone,
  onZoneSelect,
  onDeleteZone,
  currentUserId,
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
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg text-slate-800">Mis zonas</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Contenido principal condicionado por la autenticación */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* El botón ahora siempre es visible */}
          <button
            onClick={onAddZone}
            className="w-full flex items-center justify-center gap-2 py-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold text-sm"
          >
            <Plus size={18} />
            Añadir nueva Zona
          </button>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-500 gap-3 mt-8">
              <MapIcon className="w-12 h-12 text-stone-300" />
              <p className="text-sm">
                Crea una cuenta para guardar tus zonas de búsqueda personalizadas.
              </p>
            </div>
          ) : (
            <>
              {/* Lista de zonas guardadas */}
              {zonas.length === 0 && !isDraftZoneVisible ? (
                <div className="text-center text-sm text-stone-400 mt-10">
                  No tienes zonas guardadas.
                </div>
              ) : (
                <ul className="flex flex-col gap-2 mt-2">
                  {zonas.map((zona) => (
                    editingZoneId === zona.id ? (
                      <li
                        key={zona.id}
                        className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl shadow-sm"
                      >
                        <input
                          value={editingZoneName}
                          onChange={(event) => onEditingZoneNameChange?.(event.target.value)}
                          placeholder="Nueva zona"
                          maxLength={100}
                          className="min-w-0 flex-1 text-sm text-stone-700 placeholder:text-stone-400 placeholder:italic bg-transparent outline-none"
                          disabled={isSavingEditZone}
                        />
                        <button
                          onClick={onConfirmEditZone}
                          className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                          title="Guardar cambios"
                          disabled={isSavingEditZone}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={onCancelEditZone}
                          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                          title="Cancelar edición"
                          disabled={isSavingEditZone}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ) : (
                      <li
                        key={zona.id}
                        onClick={() => onZoneSelect?.(Number(zona.id))}
                        className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100 rounded-lg cursor-pointer hover:border-orange-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all duration-200 group"
                      >
                        <span className="text-sm font-medium text-stone-700 truncate pr-2">
                          {zona.nombre}
                        </span>
                        <div className="flex items-center gap-1 opacity-100">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              onEditZone(zona.id)
                            }}
                            className="p-1.5 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                            title="Editar zona"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              onDeleteZone(zona.id)
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar zona"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    )
                  ))}

                  {isDraftZoneVisible && (
                    <li className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl shadow-sm">
                      <input
                        value={draftZoneName}
                        onChange={(event) => onDraftZoneNameChange?.(event.target.value)}
                        placeholder="Nueva zona"
                        maxLength={100}
                        className="min-w-0 flex-1 text-sm text-stone-700 placeholder:text-stone-400 placeholder:italic bg-transparent outline-none"
                        disabled={isSavingDraftZone}
                      />
                      <button
                        onClick={onConfirmDraftZone}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                        title="Guardar zona"
                        disabled={isSavingDraftZone}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={onCancelDraftZone}
                        className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                        title="Cancelar"
                        disabled={isSavingDraftZone}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}