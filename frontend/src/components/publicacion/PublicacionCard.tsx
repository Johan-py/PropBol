'use client'

import { Bath, BedDouble, MapPin, Square } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useDeletePublicacion } from '@/hooks/useDeletePublicacion'
import type { MisPublicacionesItem } from '@/types/publicacion'

import ConfirmDeleteModal from './ConfirmDeleteModal'
import DeleteSuccessModal from './DeleteSuccessModal'
import DeleteErrorModal from './DeleteErrorModal'

interface Props {
  publicacion: MisPublicacionesItem
  onDeleted: (id: number) => void
  onToggleEstado?: (id: number) => void   // 👈 NUEVO
}

export default function PublicacionCard({
  publicacion,
  onDeleted,
  onToggleEstado
}: Props) {

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

  const [activa, setActiva] = useState(publicacion.estado === 'ACTIVA')

  useEffect(() => {
    setActiva(publicacion.estado === 'ACTIVA')
  }, [publicacion.estado])

  const toggleEstado = () => {
    const nuevoEstado = !activa
    setActiva(nuevoEstado)

    if (onToggleEstado) {
      onToggleEstado(publicacion.id)
    }
  }

  const precioFormateado = `$${publicacion.precio.toLocaleString()}`
  const areaFormateada = publicacion.superficieM2
    ? `${publicacion.superficieM2}m²`
    : '-'

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

          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-[#1f1f1f]">
              {publicacion.titulo}
            </h3>

            <span className="shrink-0 whitespace-nowrap text-[15px] font-bold text-[#e48b18]">
              {precioFormateado}
            </span>
          </div>

          <div className="mb-3 flex items-center justify-between rounded-xl border border-[#ddd4c8] bg-[#f7f2ec] px-3 py-2">
            <span className="text-[13px] text-[#555]">Estado:</span>

            <button
              onClick={toggleEstado}
              aria-label={activa ? 'Desactivar publicación' : 'Activar publicación'}
              className={`relative h-6 w-12 rounded-full transition ${
                activa ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  activa ? 'left-7' : 'left-1'
                }`}
              />
            </button>

            <span className="text-[13px] font-medium text-[#444]">
              {activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <div className="mb-3 flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#ddd4c8] bg-[#f7f2ec] px-3 py-2">
            <MapPin className="h-4 w-4 text-[#e6a04b]" />
            <p className="line-clamp-1 text-center text-[13px] text-[#555]">
              {publicacion.ubicacion}
            </p>
          </div>

          <div className="mb-4 grid min-h-[48px] grid-cols-3 rounded-xl border border-[#ddd4c8] bg-[#f7f2ec]">
            <div className="flex items-center justify-center gap-2 border-r border-[#ddd4c8]">
              <Bath className="h-4 w-4 text-[#e6a04b]" />
              <span>{publicacion.nroBanos ?? '-'}</span>
            </div>

            <div className="flex items-center justify-center gap-2 border-r border-[#ddd4c8]">
              <BedDouble className="h-4 w-4 text-[#e6a04b]" />
              <span>{publicacion.nroCuartos ?? '-'}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Square className="h-4 w-4 text-[#e6a04b]" />
              <span>{areaFormateada}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={abrirConfirmacion}
              className="h-11 flex-1 rounded-lg bg-[#D97706] text-[14px] font-medium text-white hover:bg-[#bf6905]"
            >
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

      <DeleteSuccessModal
        abierto={modalExitoAbierto}
        onAceptar={cerrarExito}
      />

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || 'No se puede eliminar la publicación, intente nuevamente'}
        onAceptar={cerrarError}
      />
    </>
  )
}
