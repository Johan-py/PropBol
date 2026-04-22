'use client'

import { Bath, BedDouble, MapPin, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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

  const precioFormateado = `$${publicacion.precio.toLocaleString()}`
  const areaFormateada = publicacion.superficieM2 ? `${publicacion.superficieM2}m²` : '-'

  const irAEditar = () => {
    router.push(`/mis-publicaciones/${publicacion.id}/editar`)
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#e6ddd1] bg-[#F9F6EE] shadow-sm transition-shadow hover:shadow-md">
        <div className="overflow-hidden">
          <img
            src={publicacion.imagenUrl || '/placeholder-house.jpg'}
            alt={publicacion.titulo}
            className="h-40 w-full object-cover sm:h-44"
          />
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-[#1f1f1f] sm:text-[18px]">
              <span className="line-clamp-2">{publicacion.titulo}</span>
            </h3>

            <span className="shrink-0 whitespace-nowrap pt-[1px] text-[15px] font-bold text-[#e48b18] sm:text-[16px]">
              {precioFormateado}
            </span>
          </div>

          <div className="mb-3 flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#ddd4c8] bg-[#f7f2ec] px-3 py-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#e6a04b]" />
            <p className="line-clamp-1 text-center text-[13px] text-[#555]">
              {publicacion.ubicacion}
            </p>
          </div>

          <div className="mb-4 grid min-h-[48px] grid-cols-3 overflow-hidden rounded-xl border border-[#ddd4c8] bg-[#f7f2ec]">
            <div className="flex items-center justify-center gap-2 border-r border-[#ddd4c8] px-2">
              <Bath className="h-4 w-4 shrink-0 text-[#e6a04b]" />
              <span className="text-[14px] text-[#444]">{publicacion.nroBanos ?? '-'}</span>
            </div>

            <div className="flex items-center justify-center gap-2 border-r border-[#ddd4c8] px-2">
              <BedDouble className="h-4 w-4 shrink-0 text-[#e6a04b]" />
              <span className="text-[14px] text-[#444]">{publicacion.nroCuartos ?? '-'}</span>
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
              <Square className="h-4 w-4 shrink-0 text-[#e6a04b]" />
              <span className="text-[14px] text-[#444]">{areaFormateada}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={irAEditar}
                className="h-10 rounded-lg border border-[#9a9a9a] bg-white px-3 text-[13px] font-medium text-[#2c2c2c] transition hover:bg-gray-50"
              >
                Editar
              </button>

              <button
                onClick={abrirConfirmacion}
                className="h-10 rounded-lg bg-[#D97706] px-3 text-[13px] font-medium text-white transition hover:bg-[#bf6905]"
              >
                Eliminar
              </button>
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-[#F3EBDD] px-4 py-2 text-left text-[14px] font-semibold text-[#D97706] transition hover:bg-[#eee2cf]"
            >
              + Añadir otros parámetros
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