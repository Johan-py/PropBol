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
  showPredefinidas?: boolean
  onShowPredefinidas?: (show: boolean) => void
  showPersonalizadas?: boolean
  onShowPersonalizadas?: (show: boolean) => void
  /** En móvil se renderiza como bottom sheet en vez de panel lateral */
  isMobile?: boolean
}

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
  showPredefinidas = true,
  onShowPredefinidas,
  showPersonalizadas = true,
  onShowPersonalizadas,
  isMobile = false,
}: MisZonasSidebarProps) {

  // ─── Contenido interior compartido ───────────────────────────────────────────
  const inner = (
    <>
      {/* Toggles de visibilidad de zonas */}
      <div className="px-4 py-3 border-b border-stone-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700">Zonas predefinidas</span>
          <button
            onClick={() => onShowPredefinidas?.(!showPredefinidas)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPredefinidas ? 'bg-amber-500' : 'bg-stone-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                showPredefinidas ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700">Mis zonas</span>
          <button
            onClick={() => onShowPersonalizadas?.(!showPersonalizadas)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPersonalizadas ? 'bg-green-500' : 'bg-stone-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                showPersonalizadas ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
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