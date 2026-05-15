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

      const res = await fetch(`${API_URL}/api/sesion/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      // Verificar si la respuesta es JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Respuesta no JSON:', text.substring(0, 200))
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`)
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()

      if (data.sesiones && Array.isArray(data.sesiones)) {
        setSesiones(data.sesiones)
      } else if (Array.isArray(data)) {
        setSesiones(data)
      } else {
        throw new Error('Formato de respuesta inválido')
      }
    } catch (err: any) {
      console.error('Error cargando sesiones:', err)
      setError(err.message || 'Error al cargar sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarSesiones()
  }, [])

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
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Usar Promise.all para mejor rendimiento
      const promises = seleccionadas.map(id =>
        fetch(`${API_URL}/api/sesion/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      )

      const responses = await Promise.all(promises)
      const failed = responses.filter(r => !r.ok)

      if (failed.length > 0) {
        throw new Error(`Fallaron ${failed.length} cierres de sesión`)
      }

      // Actualizar estado local
      setSesiones(prev => prev.filter(s => !seleccionadas.includes(s.id)))
      setSeleccionadas([])

    } catch (err: any) {
      console.error('Error cerrando sesiones:', err)
      setError(err.message || 'Error al cerrar sesiones')
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
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const res = await fetch(`${API_URL}/api/sesion/cerrar/todas`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al cerrar todas las sesiones')
      }

      // Mantener solo la sesión actual
      setSesiones(prev => prev.filter(s => s.esActual))
      setSeleccionadas([])

    } catch (err: any) {
      console.error('Error cerrando todas:', err)
      setError(err.message || 'Error al cerrar todas las sesiones')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Formatear fecha ───────────────────────────────────
  const formatearFecha = (fecha: string) => {
    try {
      const diff = Date.now() - new Date(fecha).getTime()
      const minutos = Math.floor(diff / 60000)
      const horas = Math.floor(diff / 3600000)
      const dias = Math.floor(diff / 86400000)

      if (minutos < 1) return 'Hace unos segundos'
      if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
      if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
      return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`
    } catch {
      return 'Fecha desconocida'
    }
  }

  const todasSeleccionadas = sesiones.filter(s => !s.esActual).length > 0 &&
    seleccionadas.length === sesiones.filter(s => !s.esActual).length

  const sesionesActivasCount = sesiones.filter(s => !s.esActual).length

  return (
    <div className="min-h-screen bg-[#EAEAEA] p-4">
     <div className="bg-[#D9D9D9] rounded-sm p-6">
    
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">
               Gestión de Sesiones Activas
          </h1>
             <p className="text-lg text-black mt-2">
               3 sesiones activas
            </p>
        </div>
        {/* Tabla/Card */}
        <div className="bg-[#F4F4F4] rounded-2xl p-8">

           {/* Header tabla */}
          <div className="max-w-5xl mx-auto grid grid-cols-4 bg-[#E8962F] text-white font-bold rounded-lg py-4 px-6 mb-4 text-center text-lg">
                <p>ID</p>
                <p>Última actividad</p>
                <p>Estado</p>
                <p>Acción</p>
                </div>
              <div className="space-y-3">

                 {sessions.map((session) => (
                    <div 
                   key={session.id}
                   className="max-w-5xl mx-auto grid grid-cols-4 items-center bg-[#E7DFD7] rounded-lg py-5 px-6 text-center text-lg">
                    
                    {/* ID */}
                <p>{session.id}.</p>

                {/* Última actividad */}
                <p>{session.activity}</p>

                {/* Estado */}
                <p>{session.status}</p>
                <div className="flex flex-col items-center">

                  <input
                    type="checkbox"
                    disabled={session.status === 'Sesión actual'}
                    className={`w-5 h-5 ${
                    session.status === 'Sesión actual'
                    ? 'cursor-not-allowed accent-red-500 opacity-60'
                    : 'cursor-pointer'
                  }`}
                   />

                  {session.status === 'Sesión actual' && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                    No se puede cerrar esta sesión
                  </p>
                  )}
                 

                </div>
              </div>
              ))}

            </div>
                
        </div>
        <div className="flex flex-col items-end mt-10 gap-5 max-w-5xl mx-auto">

          <button className="propbol-btn-select-all bg-[#CFCFCF] hover:bg-[#BDBDBD] transition px-8 py-3 rounded-lg text-lg font-medium">
            Seleccionar todas
          </button>

          <button className="propbol-btn-close-session bg-[#EC7467] hover:bg-[#df6557] text-white transition px-12 py-3 rounded-lg text-xl font-bold">
            Cerrar Sesión
        </button>

        </div>
      </div>
    </div>

  );
}