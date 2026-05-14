'use client'

import { useState, useEffect } from 'react'

interface Sesion {
  id: number
  token: string
  fechaInicio: string
  fechaExpiracion: string
  estado: boolean
  metodoAuth: string
  esActual: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ActiveSessions() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [seleccionadas, setSeleccionadas] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('token')

  // ── GET: Cargar sesiones ──────────────────────────────
  const cargarSesiones = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        // Mock si no hay token
        setSesiones([
          { id: 1, token: 'mock', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: true },
          { id: 2, token: 'mock2', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: false },
          { id: 3, token: 'mock3', fechaInicio: new Date().toISOString(), fechaExpiracion: new Date().toISOString(), estado: true, metodoAuth: 'email', esActual: false },
        ])
        return
      }
      const res = await fetch(`${API_URL}api/perfil/sesiones`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.sesiones) {
        setSesiones(data.sesiones)
      } else {
        throw new Error('Error al obtener sesiones')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarSesiones() }, [])

  // ── Seleccionar / deseleccionar ───────────────────────
  const toggleSeleccion = (id: number, esActual: boolean) => {
    if (esActual) return
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const seleccionarTodas = () => {
    const idsActivas = sesiones
      .filter(s => !s.esActual)
      .map(s => s.id)
    if (seleccionadas.length === idsActivas.length) {
      setSeleccionadas([])
    } else {
      setSeleccionadas(idsActivas)
    }
  }

  // ── DELETE: Cerrar sesiones seleccionadas ─────────────
  const cerrarSesiones = async () => {
    if (seleccionadas.length === 0) return
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (token) {
        for (const id of seleccionadas) {
          await fetch(`${API_URL}/api/sesion/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          })
        }
      }
      setSesiones(prev => prev.filter(s => !seleccionadas.includes(s.id)))
      setSeleccionadas([])
    } catch (err: any) {
      setError('Error al cerrar sesiones.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── DELETE: Cerrar todas excepto actual ───────────────
  const cerrarTodas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (token) {
        await fetch(`${API_URL}/api/sesion/cerrar/todas`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setSesiones(prev => prev.filter(s => s.esActual))
      setSeleccionadas([])
    } catch (err: any) {
      setError('Error al cerrar todas las sesiones.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Formatear fecha ───────────────────────────────────
  const formatearFecha = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const min = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)
    if (min < 60) return `Hace ${min} min`
    if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? 's' : ''}`
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  }

  const todasSeleccionadas =
    sesiones.filter(s => !s.esActual).length > 0 &&
    seleccionadas.length === sesiones.filter(s => !s.esActual).length

  return (
    <div className="min-h-screen bg-[#EAEAEA] p-4">
      <div className="bg-[#D9D9D9] rounded-sm p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">
            Gestión de Sesiones Activas
          </h1>
          <p className="text-lg text-black mt-2">
            {sesiones.length} sesiones activas
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {isLoading && sesiones.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-[#F4F4F4] rounded-2xl p-8">

            {/* HEADER TABLA */}
            <div className="max-w-5xl mx-auto grid grid-cols-4 bg-[#E8962F] text-white font-bold rounded-lg py-4 px-6 mb-4 text-center text-lg">
              <p>ID</p>
              <p>Última actividad</p>
              <p>Estado</p>
              <p>Acción</p>
            </div>

            {/* FILAS */}
            <div className="space-y-3">
              {sesiones.map((sesion) => (
                <div
                  key={sesion.id}
                  className={`max-w-5xl mx-auto grid grid-cols-4 items-center rounded-lg py-5 px-6 text-center text-lg transition-colors
                    ${seleccionadas.includes(sesion.id)
                      ? 'bg-amber-100'
                      : 'bg-[#E7DFD7]'
                    }`}
                >
                  <p>{sesion.id}.</p>
                  <p>{formatearFecha(sesion.fechaInicio)}</p>
                  <p>{sesion.esActual ? 'Sesión actual' : 'Activa'}</p>

                  <div className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(sesion.id)}
                      onChange={() => toggleSeleccion(sesion.id, sesion.esActual)}
                      disabled={sesion.esActual}
                      className={`w-5 h-5 accent-amber-500 ${sesion.esActual
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                        }`}
                    />
                    {sesion.esActual && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        No se puede cerrar esta sesión
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* BOTONES */}
        <div className="flex flex-col items-end mt-10 gap-5 max-w-5xl mx-auto">
          <button
            onClick={seleccionarTodas}
            className="bg-[#CFCFCF] hover:bg-[#BDBDBD] transition px-8 py-3 rounded-lg text-lg font-medium"
          >
            {todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>

          <div className="flex gap-4">
            <button
              onClick={cerrarTodas}
              disabled={sesiones.filter(s => !s.esActual).length === 0 || isLoading}
              className="bg-[#CFCFCF] hover:bg-[#BDBDBD] transition px-8 py-3 rounded-lg text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cerrar todas
            </button>

            <button
              onClick={cerrarSesiones}
              disabled={seleccionadas.length === 0 || isLoading}
              className={`transition px-12 py-3 rounded-lg text-xl font-bold text-white
                ${seleccionadas.length === 0 || isLoading
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-[#EC7467] hover:bg-[#df6557]'
                }`}
            >
              {isLoading ? 'Cerrando...' : `Cerrar Sesión${seleccionadas.length > 1 ? 'es' : ''} ${seleccionadas.length > 0 ? `(${seleccionadas.length})` : ''}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}