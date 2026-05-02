'use client'

import { useState, useEffect } from 'react'
import PublicacionCard from '@/components/publicacion/PublicacionCard'
import { publicacionService } from '@/services/publicacionn.service'
import type { MisPublicacionesItem } from '@/types/publicacion'

export default function MisPublicacionesList() {
  const [publicaciones, setPublicaciones] = useState<MisPublicacionesItem[]>([])
  const [estadisticas, setEstadisticas] = useState<{
    totalPublicaciones: number
    limite: number // Este valor se obtiene del backend y puede ser 3 para usuarios sin suscripción o el límite del plan para usuarios con suscripción
    disponibles: number
    tieneSuscripcion: boolean
    suscripcion: {
      id: number
      planNombre: string
      fechaInicio: string
      fechaFin: string
    } | null
  }>({
    totalPublicaciones: 0,
    limite: 3, // Límite gratuito por defecto 
    disponibles: 0, // Calculado luego de obtener datos del backend
    tieneSuscripcion: false,
    suscripcion: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'pausadas'>('todas') // 👈 NUEVO: filtro

  // Transformar datos del backend al tipo MisPublicacionesItem
  const transformarPublicacion = (pub: any): MisPublicacionesItem => {
    return {
      id: pub.id,
      titulo: pub.titulo,
      precio: parseFloat(pub.inmueble?.precio || '0'),
      ubicacion: pub.inmueble?.ubicacion?.direccion ||
        pub.inmueble?.ubicacion?.zona ||
        'Ubicación no especificada',
      nroBanos: pub.inmueble?.nroBanos ?? null,
      nroCuartos: pub.inmueble?.nroCuartos ?? null,
      superficieM2: pub.inmueble?.superficieM2 ? parseFloat(pub.inmueble.superficieM2) : null,
      imagenUrl: pub.multimedia?.[0]?.url || pub.usuario?.avatar || null,
      tipoOperacion: pub.inmueble?.tipoAccion || 'VENTA',
      activa: pub.estado === "ACTIVA",  // true = ACTIVA, false = PAUSADA o ELIMINADA
      metricas: pub.metricas || {
        visitas: 0,
        favoritos: 0,
        contactos: 0
      }
    }
  }

  const cargarPublicaciones = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await publicacionService.obtenerMisPublicaciones()

      if (data.ok) {
        // Transformar todas las publicaciones (incluidas las PAUSADA)
        const publicacionesTransformadas = data.publicaciones
          .filter((pub: any) => pub.estado !== "ELIMINADA") // 👈 Excluir solo las ELIMINADAS
          .map(transformarPublicacion)

        setPublicaciones(publicacionesTransformadas)
        setEstadisticas(data.estadisticas)
      } else {
        setError(data.msg || 'Error al cargar las publicaciones')
      }
    } catch (error) {
      console.error('Error cargando publicaciones:', error)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleted = (id: number) => {
    setPublicaciones(prev => prev.filter(p => p.id !== id))
  }

  const handleEstadoChange = (id: number, nuevoEstado: boolean) => {
    setPublicaciones(prev =>
      prev.map(p => p.id === id ? { ...p, activa: nuevoEstado } : p)
    )
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [])

  // 👈 Filtrar según selección
  const publicacionesFiltradas = publicaciones.filter(p => {
    if (filtro === 'activas') return p.activa === true
    if (filtro === 'pausadas') return p.activa === false
    return true // 'todas'
  })

  const publicacionesActivas = publicaciones.filter(p => p.activa === true)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Cargando publicaciones...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={cargarPublicaciones}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta de estadísticas */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <h3 className="font-semibold text-gray-800">
          Mi Plan actual: {estadisticas.suscripcion?.planNombre
            ? `${estadisticas.suscripcion.planNombre} ⭐`
            : 'Básico (Gratis)'}
        </h3>
        <p className="text-sm text-gray-600">
          Publicaciones Activas: {publicacionesActivas.length} / {estadisticas.limite}
          {publicacionesActivas.length >= estadisticas.limite && (
            <span className="text-yellow-600 ml-2">(Límite alcanzado)</span>
          )}
        </p>
      </div>

      {/* 👈 NUEVO: Filtros */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-lg transition ${filtro === 'todas'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Todas ({publicaciones.length})
        </button>
        <button
          onClick={() => setFiltro('activas')}
          className={`px-4 py-2 rounded-lg transition ${filtro === 'activas'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Activas ({publicaciones.filter(p => p.activa).length})
        </button>
        <button
          onClick={() => setFiltro('pausadas')}
          className={`px-4 py-2 rounded-lg transition ${filtro === 'pausadas'
            ? 'bg-yellow-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Pausadas ({publicaciones.filter(p => !p.activa).length})
        </button>
      </div>

      {/* Lista de publicaciones */}
      {publicacionesFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {filtro === 'todas' && 'No tienes publicaciones.'}
            {filtro === 'activas' && 'No tienes publicaciones activas.'}
            {filtro === 'pausadas' && 'No tienes publicaciones pausadas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicacionesFiltradas.map(pub => (
            <PublicacionCard
              key={pub.id}
              publicacion={pub}
              onDeleted={handleDeleted}
              onEstadoChange={handleEstadoChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
