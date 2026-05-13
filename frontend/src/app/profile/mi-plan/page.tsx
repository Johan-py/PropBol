'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Calendar, RefreshCw, ArrowUpRight, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Suscripcion {
  activa: boolean
  expirado?: boolean
  idSuscripcion: number | null
  planNombre: string | null
  precioPlan: number | null
  nroPublicaciones: number | null
  duracionDias: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const diasRestantes = (fechaFin: string | null) => {
  if (!fechaFin) return 0
  const diff = new Date(fechaFin).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function MiPlanPage() {
  const router = useRouter()
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.replace('/sign-in'); return }

    fetch(`${API_URL}/api/suscripciones/mi-suscripcion`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSuscripcion(data))
      .catch(() => setError('No se pudo cargar tu plan'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-red-500 text-sm">
        {error}
      </div>
    )
  }

  const dias = diasRestantes(suscripcion?.fechaFin ?? null)
  const porVencer = suscripcion?.activa && dias <= 7

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-800 mb-1">Mi Plan Actual</h1>
      <p className="text-sm text-stone-500 mb-6">
        Gestiona tu suscripción activa en PropBol.
      </p>

      {suscripcion?.activa ? (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-stone-100 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">
                Tu Suscripción Activa
              </p>
              <h2 className="text-2xl font-bold text-stone-800">{suscripcion.planNombre}</h2>
              {suscripcion.precioPlan !== null && (
                <p className="text-orange-500 font-semibold text-lg mt-1">
                  Bs. {suscripcion.precioPlan.toFixed(2)}
                  <span className="text-stone-400 text-sm font-normal"> /mes</span>
                </p>
              )}
            </div>
            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <CheckCircle2 size={13} />
              Activo
            </span>
          </div>

          {/* Fechas */}
          <div className="px-6 py-5 border-b border-stone-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Fecha inicio
                </p>
                <p className="text-sm font-medium text-stone-700">
                  {formatDate(suscripcion.fechaInicio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Vencimiento
                </p>
                <p className={`text-sm font-medium ${porVencer ? 'text-red-500' : 'text-stone-700'}`}>
                  {formatDate(suscripcion.fechaFin)}
                  {porVencer && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      Vence en {dias}d
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="px-6 py-5 border-b border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">
              Beneficios incluidos
            </p>
            <ul className="space-y-2">
              {suscripcion.nroPublicaciones !== null && (
                <li className="flex items-center gap-2 text-sm text-stone-700">
                  <CheckCircle2 size={15} className="text-orange-400 shrink-0" />
                  {suscripcion.nroPublicaciones} publicaciones activas
                </li>
              )}
              {suscripcion.duracionDias !== null && (
                <li className="flex items-center gap-2 text-sm text-stone-700">
                  <CheckCircle2 size={15} className="text-orange-400 shrink-0" />
                  {suscripcion.duracionDias} días de vigencia
                </li>
              )}
            </ul>
          </div>

          {/* Acciones */}
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/cobros-suscripciones')}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <RefreshCw size={15} />
              Renovar
            </button>
            <button
              onClick={() => router.push('/cobros-suscripciones')}
              className="flex-1 flex items-center justify-center gap-2 border border-stone-300 hover:border-orange-400 text-stone-700 hover:text-orange-600 text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <ArrowUpRight size={15} />
              Cambiar Plan
            </button>
          </div>
        </div>
      ) : suscripcion?.expirado ? (
        /* Estado expirado */
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-stone-100 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">
                Suscripción Vencida
              </p>
              <h2 className="text-2xl font-bold text-stone-800">{suscripcion.planNombre}</h2>
              {suscripcion.precioPlan !== null && (
                <p className="text-stone-400 font-semibold text-lg mt-1">
                  Bs. {suscripcion.precioPlan.toFixed(2)}
                  <span className="text-stone-400 text-sm font-normal"> /mes</span>
                </p>
              )}
            </div>
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <XCircle size={13} />
              Expirado
            </span>
          </div>
          <div className="px-6 py-5 border-b border-stone-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Fecha inicio
                </p>
                <p className="text-sm font-medium text-stone-700">
                  {formatDate(suscripcion.fechaInicio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Venció el
                </p>
                <p className="text-sm font-medium text-red-500">
                  {formatDate(suscripcion.fechaFin)}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/cobros-suscripciones')}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <RefreshCw size={15} />
              Renovar Plan
            </button>
          </div>
        </div>
      ) : (
        /* Estado vacío */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white shadow-sm px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <XCircle size={48} className="text-stone-300" />
          </div>
          <h3 className="text-base font-semibold text-stone-700 mb-1">Sin Plan Activo</h3>
          <p className="text-sm text-stone-400 mb-6">
            Aún no tienes una suscripción. Elige un plan para ampliar tus publicaciones.
          </p>
          <button
            onClick={() => router.push('/cobros-suscripciones')}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
          >
            <ArrowUpRight size={15} />
            Ver Planes Disponibles
          </button>
        </div>
      )}
    </div>
  )
}
