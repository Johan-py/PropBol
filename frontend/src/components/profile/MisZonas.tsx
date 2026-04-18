'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Pencil, Check, X, Loader2, MapPin, Plus } from 'lucide-react'
import nextDynamic from 'next/dynamic'

const MapaZonas = nextDynamic(() => import('./MapaZonas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Cargando mapa...
    </div>
  ),
})

interface Zona {
  id: number
  nombre: string
  referencia: string
  activa: boolean
  coordenadas?: { lat: number; lng: number; zoom: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function MisZonas() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null)
  const [zonaActiva, setZonaActiva] = useState<Zona | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalNuevaZona, setModalNuevaZona] = useState(false)
  const [nombreNuevaZona, setNombreNuevaZona] = useState('')
  const [referenciaNuevaZona, setReferenciaNuevaZona] = useState('')

  const getToken = () => localStorage.getItem('token')

  const cargarZonas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        setZonas([
          { id: 1, nombre: 'Zona Norte - Cochabamba', referencia: 'Cochabamba, Bolivia', activa: true, coordenadas: { lat: -17.3895, lng: -66.1568, zoom: 14 } },
          { id: 2, nombre: 'Cerca del Cristo de la Concordia', referencia: 'Cochabamba, Bolivia', activa: false, coordenadas: { lat: -17.4058, lng: -66.1423, zoom: 15 } },
          { id: 3, nombre: 'Cerca del Parque Fidel Anze', referencia: 'Cochabamba, Bolivia', activa: false, coordenadas: { lat: -17.3950, lng: -66.1600, zoom: 15 } },
        ])
        setIsLoading(false)
        return
      }
      const response = await fetch(`${API_URL}/api/perfil/zonas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.ok) {
        setZonas(data.zonas || [])
      } else {
        throw new Error(data.msg)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las zonas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarZonas() }, [])

  useEffect(() => {
    const activa = zonas.find(z => z.activa) || null
    setZonaActiva(activa)
  }, [zonas])

  const seleccionarZona = (zona: Zona) => {
    setZonaActiva(zona)
    localStorage.setItem('zonaSeleccionada', JSON.stringify(zona))
  }

  const guardarNuevaZona = async () => {
    if (!nombreNuevaZona.trim()) return
    setIsLoading(true)
    try {
      const token = getToken()
      const nuevaZona: Zona = {
        id: Date.now(),
        nombre: nombreNuevaZona,
        referencia: referenciaNuevaZona || 'Cochabamba, Bolivia',
        activa: false,
        coordenadas: { lat: -17.3895, lng: -66.1568, zoom: 14 }
      }
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: nombreNuevaZona, referencia: referenciaNuevaZona })
        })
        const data = await response.json()
        if (data.ok) nuevaZona.id = data.zona?.id || nuevaZona.id
      }
      setZonas(prev => [...prev, nuevaZona])
      setModalNuevaZona(false)
      setNombreNuevaZona('')
      setReferenciaNuevaZona('')
    } catch (err: any) {
      alert(err.message || 'Error al guardar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const iniciarEdicion = (zona: Zona, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoId(zona.id)
    setNombreEditado(zona.nombre)
  }

  const guardarEdicion = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!nombreEditado.trim()) return
    setIsLoading(true)
    try {
      const token = getToken()
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: nombreEditado })
        })
        const data = await response.json()
        if (!data.ok) throw new Error(data.msg)
      }
      setZonas(prev => prev.map(z => z.id === id ? { ...z, nombre: nombreEditado } : z))
      setEditandoId(null)
    } catch (err: any) {
      alert(err.message || 'Error al actualizar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelarEdicion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoId(null)
    setNombreEditado('')
  }

  const eliminarZona = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      const token = getToken()
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (!data.ok) throw new Error(data.msg)
      }
      setZonas(prev => prev.filter(z => z.id !== id))
      setConfirmandoEliminarId(null)
    } catch (err: any) {
      alert(err.message || 'Error al eliminar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActiva = async (zona: Zona, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const token = getToken()
      if (token) {
        await fetch(`${API_URL}/api/perfil/zonas/${zona.id}/activa`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ activa: !zona.activa })
        })
      }
      setZonas(prev => prev.map(z => z.id === zona.id ? { ...z, activa: !z.activa } : z))
    } catch {
      console.error('Error al cambiar estado')
    }
  }

  const cerrarModal = () => {
    setModalNuevaZona(false)
    setNombreNuevaZona('')
    setReferenciaNuevaZona('')
  }

  if (isLoading && zonas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mis Zonas</h1>
        <p className="text-sm text-stone-500 mt-1">
          Gestiona tus zonas guardadas para reutilizar búsquedas por área geográfica.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* MAPA */}
        <div className="w-full lg:w-3/5 bg-white border border-[#e5dfd7] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5dfd7]">
            <h2 className="font-semibold text-stone-800">Mapa</h2>
            <button
              onClick={() => setModalNuevaZona(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              Nueva zona
            </button>
          </div>
          <div className="relative w-full overflow-hidden" style={{ height: '420px', zIndex: 0 }}>
            <MapaZonas
              zonas={zonas}
              zonaActiva={zonaActiva}
              onZonaClick={seleccionarZona}
            />
          </div>
          {zonaActiva && (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-200">
              <p className="text-sm text-stone-700">
                <span className="font-semibold">Zona activa:</span> {zonaActiva.nombre}
              </p>
            </div>
          )}
        </div>

        {/* LISTA */}
        <div className="w-full lg:w-2/5 bg-white border border-[#e5dfd7] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5dfd7]">
            <h2 className="font-semibold text-stone-800">Mis zonas guardadas</h2>
            <p className="text-xs text-stone-400 mt-0.5">Selecciona una zona para verla en el mapa.</p>
          </div>
          <div className="p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '460px' }}>
            {zonas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
                <MapPin size={36} strokeWidth={1} />
                <p className="text-sm">No tienes zonas guardadas.</p>
              </div>
            ) : (
              zonas.map((zona) => (
                <div
                  key={zona.id}
                  onClick={() => seleccionarZona(zona)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all
                    ${zonaActiva?.id === zona.id
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-[#e5dfd7] bg-white hover:border-amber-300 hover:bg-stone-50'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      {editandoId === zona.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={nombreEditado}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setNombreEditado(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') cancelarEdicion(e as any) }}
                          className="w-full px-2 py-1 text-sm border border-amber-500 rounded bg-white focus:outline-none"
                        />
                      ) : (
                        <p className="font-semibold text-stone-800 text-sm truncate">{zona.nombre}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">{zona.referencia}</p>
                    </div>
                    {zona.activa && (
                      <span className="shrink-0 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">
                        Activa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {editandoId === zona.id ? (
                      <>
                        <button onClick={(e) => guardarEdicion(zona.id, e)} className="flex items-center gap-1 px-3 py-1 text-xs border border-green-400 text-green-600 hover:bg-green-50 rounded-md">
                          <Check size={12} /> Guardar
                        </button>
                        <button onClick={cancelarEdicion} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-500 rounded-md">
                          <X size={12} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => iniciarEdicion(zona, e)} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-600 rounded-md transition-colors">
                          <Pencil size={12} /> Editar
                        </button>
                        {confirmandoEliminarId === zona.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-stone-500">¿Eliminar?</span>
                            <button onClick={(e) => eliminarZona(zona.id, e)} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md">Sí</button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmandoEliminarId(null) }} className="px-2 py-1 text-xs border border-stone-300 text-stone-500 rounded-md">No</button>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmandoEliminarId(zona.id) }} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-500 rounded-md transition-colors">
                            <Trash2 size={12} /> Eliminar
                          </button>
                        )}
                        <div className="ml-auto">
                          <input
                            type="checkbox"
                            checked={zona.activa}
                            onChange={(e) => toggleActiva(zona, e as any)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalNuevaZona && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-lg">Nueva Zona</h3>
              <button onClick={cerrarModal} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ej: Zona Norte Cochabamba"
                  value={nombreNuevaZona}
                  onChange={(e) => setNombreNuevaZona(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Referencia</label>
                <input
                  type="text"
                  placeholder="Ej: Cerca del Cristo de la Concordia"
                  value={referenciaNuevaZona}
                  onChange={(e) => setReferenciaNuevaZona(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Área en el mapa</label>
                <div className="w-full h-44 bg-stone-100 rounded-lg border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
                  <MapPin size={28} strokeWidth={1} />
                  <p className="text-xs text-center px-4">
                    El dibujo de polígonos se integrará próximamente.<br />
                    Por ahora guarda el nombre y referencia.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50">
              <button onClick={cerrarModal} className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800">
                Cancelar
              </button>
              <button
                onClick={guardarNuevaZona}
                disabled={!nombreNuevaZona.trim() || isLoading}
                className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors
                  ${!nombreNuevaZona.trim() || isLoading ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {isLoading ? 'Guardando...' : 'Guardar zona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}