'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ReceiptText } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Pago {
  id: number
  referencia: string
  fecha: string | null
  plan: string | null
  metodo: string | null
  monto: number
  estado: string
}

type FiltroEstado = 'TODOS' | 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO'

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  COMPLETADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  CANCELADO: 'bg-stone-100 text-stone-500',
}

const METODO_LABEL: Record<string, string> = {
  QR_BANCARIO: 'QR',
  QR_BANCARIO_MENSUAL: 'QR',
  QR_BANCARIO_ANUAL: 'QR Anual',
  USDT_TRC20: 'USDT',
}

const METODO_STYLE: Record<string, string> = {
  QR_BANCARIO: 'bg-orange-100 text-orange-600',
  QR_BANCARIO_MENSUAL: 'bg-orange-100 text-orange-600',
  QR_BANCARIO_ANUAL: 'bg-orange-100 text-orange-600',
  USDT_TRC20: 'bg-blue-100 text-blue-600',
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function HistorialPagosPage() {
  const router = useRouter()
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroEstado>('TODOS')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.replace('/sign-in'); return }

    fetch(`${API_URL}/api/transacciones/mis-pagos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPagos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false))
  }, [router])

  const pagosFiltrados =
    filtro === 'TODOS' ? pagos : pagos.filter((p) => p.estado === filtro)

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-stone-800">Historial de Pagos</h1>
      </div>
      <p className="text-sm text-stone-500 mb-6">
        Orden descendente · Más reciente primero
      </p>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['TODOS', 'PENDIENTE', 'COMPLETADO', 'RECHAZADO', 'CANCELADO'] as FiltroEstado[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                filtro === f
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-400'
              }`}
            >
              {f === 'TODOS' ? 'Todos los estados' : ESTADO_LABEL[f] ?? f}
            </button>
          )
        )}
      </div>

      {pagosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-8 py-12 text-center">
          <ReceiptText size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-500">
            {filtro === 'TODOS'
              ? 'Aún no tienes movimientos registrados.'
              : `No hay pagos con estado "${ESTADO_LABEL[filtro] ?? filtro}".`}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {['Ref.', 'Fecha', 'Plan', 'Método', 'Monto', 'Estado'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-stone-100 last:border-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-stone-500">
                      {p.referencia}
                    </td>
                    <td className="px-5 py-3.5 text-stone-700">{formatDate(p.fecha)}</td>
                    <td className="px-5 py-3.5 text-stone-700">{p.plan ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {p.metodo ? (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            METODO_STYLE[p.metodo] ?? 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {METODO_LABEL[p.metodo] ?? p.metodo}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-stone-800">
                      {p.metodo === 'USDT_TRC20'
                        ? `${p.monto.toFixed(2)} USDT`
                        : `Bs. ${p.monto.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          ESTADO_STYLE[p.estado] ?? 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {ESTADO_LABEL[p.estado] ?? p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-stone-100">
            {pagosFiltrados.map((p) => (
              <div key={p.id} className="px-4 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-400">{p.referencia}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      ESTADO_STYLE[p.estado] ?? 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {ESTADO_LABEL[p.estado] ?? p.estado}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-700">{p.plan ?? '—'}</span>
                  <span className="text-sm font-semibold text-stone-800">
                    {p.metodo === 'USDT_TRC20'
                      ? `${p.monto.toFixed(2)} USDT`
                      : `Bs. ${p.monto.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{formatDate(p.fecha)}</span>
                  {p.metodo && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        METODO_STYLE[p.metodo] ?? 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {METODO_LABEL[p.metodo] ?? p.metodo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
