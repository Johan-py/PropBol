'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useDeletePublicacion } from '@/hooks/useDeletePublicacion'
import type { MisPublicacionesItem } from '@/types/publicacion'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import DeleteSuccessModal from './DeleteSuccessModal'
import DeleteErrorModal from './DeleteErrorModal'

interface Props {
  publicacion: MisPublicacionesItem
  onDeleted: (id: number) => void
}

export default function PublicacionCard({ publicacion, onDeleted }: Props) {
  // Estado local para manejar visualmente el switch de Activa/Inactiva
  const [activa, setActiva] = useState(publicacion.activa ?? true)

  const {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    modalErrorAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    cerrarError,
    confirmarEliminacion
  } = useDeletePublicacion(publicacion.id, () => onDeleted(publicacion.id))

  const precioFormateado = `Bs. ${publicacion.precio.toLocaleString('es-BO')}`
  const tipoOperacionTexto = publicacion.tipoOperacion || 'Venta / Alquiler'

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="relative">
          <img
            src={publicacion.imagenUrl || '/placeholder-house.jpg'}
            alt={publicacion.titulo}
            className="h-[180px] w-full object-cover"
          />
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-1 line-clamp-2 text-[16px] font-medium leading-tight text-gray-900">
                {publicacion.titulo}
              </h3>
              <p className="mb-1 text-[16px] font-bold text-gray-900">
                {precioFormateado}
              </p>
              <p className="text-[13px] text-gray-500">
                {tipoOperacionTexto}
              </p>
            </div>

            <div className="flex flex-col items-center pt-1">
              <button
                type="button"
                onClick={() => setActiva(!activa)}
                aria-label={activa ? 'Desactivar publicación' : 'Activar publicación'}
                title={activa ? 'Desactivar publicación' : 'Activar publicación'}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  activa ? 'bg-[#4ade80]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    activa ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="mt-1 text-[12px] font-medium text-gray-800">
                {activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

          <div className="mt-2 flex justify-center">
            <button
              onClick={abrirConfirmacion}
              className="flex h-9 w-32 items-center justify-center gap-2 rounded-xl border border-[#c4a9a9] bg-white text-[13px] font-medium text-[#8c6b6b] transition hover:bg-[#fff5f5] hover:text-[#d9534f]"
            >
              <Trash2 size={15} />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        abierto={modalConfirmacionAbierto}
        onAceptar={confirmarEliminacion}
        onCancelar={cerrarConfirmacion}
        loading={loading}
      />

      <DeleteSuccessModal abierto={modalExitoAbierto} onAceptar={cerrarExito} />

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || 'No se puede eliminar la publicación, intente nuevamente'}
        onAceptar={cerrarError}
      />
    </>
  )
}

