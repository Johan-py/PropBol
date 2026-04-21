'use client'

import { Bath, BedDouble, MapPin, Square } from 'lucide-react'
import { useState } from 'react'
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

  const [activa, setActiva] = useState(publicacion.estado === "ACTIVA")

  const toggleEstado = () => {
    setActiva((prev: boolean) => !prev)
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
            <h3 className="min-w-0 flex-1 text-[17px] font-bold">
              {publicacion.titulo}
            </h3>

            <span className="text-[15px] font-bold text-[#e48b18]">
              {precioFormateado}
            </span>
          </div>

          <div className="mb-3 flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-[13px]">Estado:</span>

            <button
            onClick={toggleEstado}
            aria-label={activa ? "Desactivar publicación" : "Activar publicación"}
            className={`relative h-6 w-12 rounded-full ${activa ? 'bg-green-500' : 'bg-gray-400'}`}
          >

              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full ${activa ? 'left-7' : 'left-1'}`} />
            </button>

            <span>{activa ? 'Activa' : 'Inactiva'}</span>
          </div>

          <div className="mb-3 flex justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <p>{publicacion.ubicacion}</p>
          </div>

          <div className="mb-4 grid grid-cols-3">
            <div className="flex justify-center gap-2">
              <Bath className="h-4 w-4" />
              <span>{publicacion.nroBanos ?? '-'}</span>
            </div>

            <div className="flex justify-center gap-2">
              <BedDouble className="h-4 w-4" />
              <span>{publicacion.nroCuartos ?? '-'}</span>
            </div>

            <div className="flex justify-center gap-2">
              <Square className="h-4 w-4" />
              <span>{areaFormateada}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/editarPublicacion?id=${publicacion.id}`)}
              className="h-11 flex-1 border rounded-lg"
            >
              Editar
            </button>

            <button
              onClick={abrirConfirmacion}
              className="h-11 flex-1 bg-orange-600 text-white rounded-lg"
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

      <DeleteSuccessModal abierto={modalExitoAbierto} onAceptar={cerrarExito} />

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || 'Error'}
        onAceptar={cerrarError}
      />
    </>
  )
}



