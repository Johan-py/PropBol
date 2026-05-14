'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt, ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface Transaccion {
  id: number
  referencia: string
  plan: string
  subtotal: number
  iva_monto: number
  total: number
  monto_descuento: number
  metodo_pago: string
  estado: string
  fecha: string | null
  fecha_completado: string | null
}

const estadoBadge: Record<string, { label: string; icon: React.FC<{ className?: string }>; cls: string }> = {
  COMPLETADO: { label: 'Completado', icon: CheckCircle, cls: 'bg-green-50 text-green-700 border-green-100' },
  PENDIENTE:  { label: 'Pendiente',  icon: Clock,        cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  CANCELADO:  { label: 'Cancelado',  icon: XCircle,      cls: 'bg-stone-50 text-stone-500 border-stone-200' },
  RECHAZADO:  { label: 'Rechazado',  icon: AlertCircle,  cls: 'bg-red-50 text-red-600 border-red-100' },
}

const metodoPagoLabel: Record<string, string> = {
  QR_BANCARIO:         'QR Bancario',
  QR_BANCARIO_MENSUAL: 'QR Bancario (mensual)',
  QR_BANCARIO_ANUAL:   'QR Bancario (anual)',
  USDT_TRC20:          'USDT TRC20',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function HistorialPagosPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    fetch(`${API_URL}/api/transacciones/mis-transacciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTransacciones(data)
        else setError('Error al cargar el historial')
      })
      .catch(() => setError('Error al cargar el historial'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7 text-amber-600" />
          <h1 className="text-2xl font-bold font-montserrat text-stone-900">
            Historial de <span className="text-amber-600">Pagos</span>
          </h1>
        </div>

        <Link
          href="/profile/mi-plan"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Mi Plan Actual
        </Link>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600 text-sm">
            {error}
          </div>
        ) : transacciones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-2">
            <Receipt className="h-10 w-10 text-stone-300 mx-auto" />
            <p className="text-stone-500 text-sm">Aún no tienes transacciones registradas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transacciones.map((t) => {
              const badge = estadoBadge[t.estado] ?? estadoBadge.PENDIENTE
              const BadgeIcon = badge.icon
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-montserrat text-stone-900">{t.plan}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{t.referencia}</p>
                      <p className="text-xs text-stone-400">{metodoPagoLabel[t.metodo_pago] ?? t.metodo_pago}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-montserrat text-stone-900">
                        Bs. {t.total.toFixed(2)}
                      </p>
                      {t.monto_descuento > 0 && (
                        <p className="text-xs text-green-600">-Bs. {t.monto_descuento.toFixed(2)} descuento</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between text-xs text-stone-400">
                    <span>Fecha: {formatDate(t.fecha)}</span>
                    {t.fecha_completado && (
                      <span>Completado: {formatDate(t.fecha_completado)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
