'use client'

import { useState } from 'react'
import {Bath,BedDouble,Eye,Heart,Mail,MapPin,Plus,Share2,Square,Trash2} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { publicacionService } from '@/services/publicacionn.service'
import type { MisPublicacionesItem } from '@/types/publicacion'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import DeleteSuccessModal from './DeleteSuccessModal'
import DeleteErrorModal from './DeleteErrorModal'
import PublicitarModal from './PublicitarModal'
import CancelarPublicidadModal from './CancelarPublicidadModal'

interface Props {
  publicacion: MisPublicacionesItem
  onDeleted: (id: number) => void
  onEstadoChange?: (id: number, nuevoEstado: boolean) => void
  onPromovidaChange?: (id: number, promovida: boolean) => void
  sourceTab?: 'todas' | 'activas' | 'pausadas' | 'publicidad'
}

export default function PublicacionCard({
  publicacion,
  onDeleted,
  onEstadoChange,
  onPromovidaChange,
  sourceTab
}: Props) {
  const router = useRouter()

  const [activa, setActiva] = useState(publicacion.activa ?? true)
  const [promovida, setPromovida] = useState(publicacion.promovida ?? false)
  const [isToggling, setIsToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')

  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false)
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false)
  const [modalErrorAbierto, setModalErrorAbierto] = useState(false)
  const [modalPublicitarAbierto, setModalPublicitarAbierto] = useState(false)
  const [modalCancelarPublicidadAbierto, setModalCancelarPublicidadAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggle = async () => {
    const nuevoEstado = !activa

    setActiva(nuevoEstado)
    setIsToggling(true)
    setToggleError('')

    try {
      await publicacionService.toggleEstado(publicacion.id, nuevoEstado)
      onEstadoChange?.(publicacion.id, nuevoEstado)
    } catch (err) {
      setActiva(!nuevoEstado)
      setToggleError(err instanceof Error ? err.message : 'Error al cambiar el estado')
      setTimeout(() => setToggleError(''), 3000)
    } finally {
      setIsToggling(false)
    }
  }

  const eliminarPublicacion = async () => {
    try {
      setLoading(true)
      setError('')

      await publicacionService.eliminar(publicacion.id)

      setModalConfirmacionAbierto(false)
      setModalExitoAbierto(true)
    } catch (err) {
      setModalConfirmacionAbierto(false)
      setError(
        err instanceof Error
          ? err.message
          : 'No se puede eliminar la publicación, intente nuevamente'
      )
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

  const handlePublicitarExito = (_planNombre: string, _dias: number) => {
    setPromovida(true)
    onPromovidaChange?.(publicacion.id, true)
  }

  const handleCancelarPublicidadConfirmado = () => {
    setPromovida(false)
    setModalCancelarPublicidadAbierto(false)
    onPromovidaChange?.(publicacion.id, false)
  }

  const precioFormateado = `USD ${publicacion.precio.toLocaleString('en-US')}`
  const tipoOperacionTexto = publicacion.tipoOperacion || 'Venta / Alquiler'

  const totalVisualizaciones = publicacion.totalVisualizaciones ?? 0
  const totalCompartidos = publicacion.totalCompartidos ?? 0

  const irAEditar = () => {
    router.push(`/mis-publicaciones/${publicacion.id}/editar`)
  }

  const irAParametros = () => {
    router.push(
      `/propiedades/parametros?publicacionId=${publicacion.id}&returnTo=mis-publicaciones`
    )
  }

  const mostrarMetricas = false

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="relative">
          <img
            src={publicacion.imagenUrl || '/placeholder-house.jpg'}
            alt={publicacion.titulo}
            className="h-[180px] w-full object-cover"
          />

          {promovida && (
            <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-[#D97706] to-[#f59e0b] px-3 py-1 text-xs font-bold text-white shadow">
              ⭐ Destacada
            </span>
          )}

          {!activa && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
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

              <div className="mb-1 flex items-center gap-1 text-[13px] text-gray-500">
                <MapPin size={14} />
                <span>{publicacion.ubicacion}</span>
              </div>

              <p className="mb-1 text-[16px] font-bold text-gray-900">
                {precioFormateado}
              </p>

              <div className="mt-2 flex items-center gap-8 text-xs text-[#1f1f1f]">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-black" />
                  <div className="leading-tight">
                    <p className="text-[10px] text-[#5f5f5f]">
                      Visualizaciones
                    </p>
                    <p className="text-center text-sm font-semibold text-black">
                      {totalVisualizaciones}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-black" />
                  <div className="leading-tight">
                    <p className="text-[10px] text-[#5f5f5f]">Compartidos</p>
                    <p className="text-center text-sm font-semibold text-black">
                      {totalCompartidos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <BedDouble size={14} />
                  <span>{publicacion.nroCuartos ?? '-'} habs</span>
                </div>

                <div className="flex items-center gap-1">
                  <Bath size={14} />
                  <span>{publicacion.nroBanos ?? '-'} baños</span>
                </div>

                <div className="flex items-center gap-1">
                  <Square size={14} />
                  <span>{publicacion.superficieM2 ?? '-'} m²</span>
                </div>
              </div>

              <p className="mt-1 text-[13px] text-gray-500">
                {tipoOperacionTexto}
              </p>
            </div>

            <div className="flex flex-col items-center pt-1">
              <button
                type="button"
                onClick={handleToggle}
                disabled={isToggling}
                aria-label={activa ? 'Desactivar publicación' : 'Activar publicación'}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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
                {isToggling ? '...' : activa ? 'Activa' : 'Inactiva'}
              </span>

              {toggleError && (
                <span className="mt-1 text-[10px] text-red-500">
                  {toggleError}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {mostrarMetricas && publicacion.metricas && (
              <div className="grid grid-cols-3 gap-3 border-b border-gray-200 pb-3">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Eye size={16} className="text-blue-500" />
                    <span className="text-xs text-gray-500">Visitas</span>
                  </div>

                  <span className="mt-1 text-sm font-semibold text-gray-900">
                    {publicacion.metricas.visitas}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Heart size={16} className="text-red-500" />
                    <span className="text-xs text-gray-500">Favoritos</span>
                  </div>

                  <span className="mt-1 text-sm font-semibold text-gray-900">
                    {publicacion.metricas.favoritos}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600">
                    <Mail size={16} className="text-green-500" />
                    <span className="text-xs text-gray-500">Contactos</span>
                  </div>

                  <span className="mt-1 text-sm font-semibold text-gray-900">
                    {publicacion.metricas.contactos}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={irAEditar}
                className="h-10 rounded-lg border border-[#9a9a9a] bg-white px-3 text-[13px] font-medium text-[#2c2c2c] transition hover:bg-gray-50"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={abrirConfirmacion}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D97706] px-3 text-[13px] font-medium text-white transition hover:bg-[#bf6905]"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>

            <div className="mt-1 flex justify-start">
              <button
                type="button"
                onClick={irAParametros}
                className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[12px] font-semibold text-orange-600 shadow-none outline-none transition hover:text-orange-700 hover:underline"
              >
                <Plus size={12} />
                Añadir otros parámetros
              </button>
            </div>

            {sourceTab === 'activas' && !promovida && (
              <button
                type="button"
                onClick={() => setModalPublicitarAbierto(true)}
                className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#D97706] to-[#f59e0b] text-[13px] font-semibold text-white shadow transition hover:opacity-90"
              >
                🚀 Publicitar
              </button>
            )}

            {sourceTab === 'publicidad' && promovida && (
              <button
                type="button"
                onClick={() => setModalCancelarPublicidadAbierto(true)}
                className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-500 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
              >
                ⛔ Cancelar publicidad
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        abierto={modalConfirmacionAbierto}
        onAceptar={eliminarPublicacion}
        onCancelar={cerrarConfirmacion}
        loading={loading}
      />

      <DeleteSuccessModal abierto={modalExitoAbierto} onAceptar={cerrarExito} />

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || 'No se puede eliminar la publicación, intente nuevamente'}
        onAceptar={cerrarError}
      />

      <PublicitarModal
        abierto={modalPublicitarAbierto}
        publicacionId={publicacion.id}
        tituloPub={publicacion.titulo}
        onCerrar={() => setModalPublicitarAbierto(false)}
        onExito={handlePublicitarExito}
      />

      <CancelarPublicidadModal
        abierto={modalCancelarPublicidadAbierto}
        publicacionId={publicacion.id}
        tituloPub={publicacion.titulo}
        onCerrar={() => setModalCancelarPublicidadAbierto(false)}
        onConfirmado={handleCancelarPublicidadConfirmado}
      />
    </>
  )
}