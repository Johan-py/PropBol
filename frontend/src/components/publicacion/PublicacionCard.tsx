'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { publicacionService } from '@/services/publicacionn.service'
import type { MisPublicacionesItem } from '@/types/publicacion'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import DeleteSuccessModal from './DeleteSuccessModal'
import DeleteErrorModal from './DeleteErrorModal'

interface Props {
  publicacion: MisPublicacionesItem
  onDeleted: (id: number) => void
  onEstadoChange?: (id: number, nuevoEstado: boolean) => void
}

export default function PublicacionCard({ publicacion, onDeleted, onEstadoChange }: Props) {
  const [activa, setActiva] = useState(publicacion.activa ?? true)
  const [isToggling, setIsToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')

  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false)
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false)
  const [modalErrorAbierto, setModalErrorAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Toggle activa/inactiva con conexión al backend
  const handleToggle = async () => {
    const nuevoEstado = !activa

    // UI optimista: cambiar visualmente primero
    setActiva(nuevoEstado)
    setIsToggling(true)
    setToggleError('')

    try {
      await publicacionService.toggleEstado(publicacion.id, nuevoEstado)
      onEstadoChange?.(publicacion.id, nuevoEstado)
    } catch (err) {
      // Revertir si falló
      setActiva(!nuevoEstado)
      setToggleError(err instanceof Error ? err.message : 'Error al cambiar el estado')
      setTimeout(() => setToggleError(''), 3000)
    } finally {
      setIsToggling(false)
    }
  }

  // Eliminar publicación con conexión al backend
  const eliminarPublicacion = async () => {
    try {
      setLoading(true)
      setError('')

      await publicacionService.eliminar(publicacion.id)

      setModalConfirmacionAbierto(false)
      setModalExitoAbierto(true)
    } catch (err) {
      setModalConfirmacionAbierto(false)
      setError(err instanceof Error ? err.message : 'No se puede eliminar la publicación, intente nuevamente')
      setModalErrorAbierto(true)
    } finally {
      setLoading(false)
    }
  }

  const abrirConfirmacion = () => {
    setError('')
    setModalConfirmacionAbierto(true)
  }

  const cerrarConfirmacion = () => {
    if (loading) return
    setModalConfirmacionAbierto(false)
  }

  const cerrarExito = () => {
    setModalExitoAbierto(false)
    onDeleted(publicacion.id)
  }

  const cerrarError = () => {
    setModalErrorAbierto(false)
    setError('')
  }

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
          {!activa && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Desactivada
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-1 line-clamp-2 text-[16px] font-medium leading-tight text-gray-900">
                {publicacion.titulo}
              </h3>
              <p className="text-[13px] text-gray-500 mb-1">
                {publicacion.ubicacion}
              </p>
              <p className="mb-1 text-[16px] font-bold text-gray-900">
                {precioFormateado}
              </p>
              <div className="flex gap-3 text-xs text-gray-500">
                {publicacion.nroCuartos !== null && (
                  <span>{publicacion.nroCuartos} habs</span>
                )}
                {publicacion.nroBanos !== null && (
                  <span>{publicacion.nroBanos} baños</span>
                )}
                {publicacion.superficieM2 !== null && (
                  <span>{publicacion.superficieM2} m²</span>
                )}
              </div>
              <p className="text-[13px] text-gray-500 mt-1">
                {tipoOperacionTexto}
              </p>
            </div>

            <div className="flex flex-col items-center pt-1">
              <button
                type="button"
                onClick={handleToggle}
                disabled={isToggling}
                aria-label={activa ? 'Desactivar publicación' : 'Activar publicación'}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${activa ? 'bg-[#4ade80]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activa ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
              <span className="mt-1 text-[12px] font-medium text-gray-800">
                {isToggling ? '...' : (activa ? 'Activa' : 'Inactiva')}
              </span>
              {toggleError && (
                <span className="mt-1 text-[10px] text-red-500">
                  {toggleError}
                </span>
              )}
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
        onAceptar={eliminarPublicacion}
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