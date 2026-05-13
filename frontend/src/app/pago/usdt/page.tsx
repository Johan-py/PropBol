'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Copy, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react'
import Stepper from '@/components/ui/Stepper'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface PagoUsdt {
  id: number
  walletAddress: string
  totalBob: number
  totalUsdt: number
  bob_per_usdt: number
  red: string
  token: string
  fechaExpiracion: string
  referencia: string
  planNombre: string
}

export default function PagoUsdtPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const transaccionId = searchParams.get('transaccionId')

  const [pago, setPago] = useState<PagoUsdt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [txHash, setTxHash] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [resultadoVerif, setResultadoVerif] = useState<{ ok: boolean; msg: string } | null>(null)

  const [copied, setCopied] = useState<'wallet' | 'amount' | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!transaccionId) {
      setError('Falta el ID de transacción')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token') ?? ''
    fetch(`${API_URL}/api/usdt/tipo-cambio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(() => {
        // tipo-cambio obtenido, ahora cargamos la transacción desde localStorage si existe
        const stored = localStorage.getItem('usdtPayment')
        if (stored) {
          const parsed = JSON.parse(stored) as PagoUsdt
          if (String(parsed.id) === transaccionId) {
            setPago(parsed)
            setLoading(false)
            return
          }
        }
        setError('No se encontró la información del pago USDT. Vuelve al resumen.')
        setLoading(false)
      })
      .catch(() => {
        setError('Error al conectar con el servidor')
        setLoading(false)
      })
  }, [transaccionId])

  useEffect(() => {
    if (!pago) return
    const remaining = Math.max(
      0,
      Math.floor((new Date(pago.fechaExpiracion).getTime() - Date.now()) / 1000)
    )
    setTimeLeft(remaining)
  }, [pago])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const id = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft !== 0 || expiredRef.current || !pago) return
    expiredRef.current = true
    fetch(`${API_URL}/api/transacciones/${pago.id}/cancelar`, { method: 'PATCH' }).catch(() => {})
    localStorage.removeItem('usdtPayment')
  }, [timeLeft, pago])

  const copyText = async (text: string, key: 'wallet' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* sin soporte */ }
  }

  const verificarTx = async () => {
    if (!pago || !txHash.trim()) return
    setVerificando(true)
    setResultadoVerif(null)
    try {
      const token = localStorage.getItem('token') ?? ''
      const res = await fetch(`${API_URL}/api/usdt/${pago.id}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txHash: txHash.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResultadoVerif({ ok: false, msg: data.error ?? 'Error al verificar' })
        return
      }
      if (data.confirmada) {
        localStorage.removeItem('usdtPayment')
        router.push('/pago/confirmacion')
      } else {
        setResultadoVerif({ ok: false, msg: data.mensaje ?? 'No confirmada aún' })
      }
    } catch {
      setResultadoVerif({ ok: false, msg: 'Error de red al verificar' })
    } finally {
      setVerificando(false)
    }
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const isExpired = timeLeft === 0
  const isUrgent = timeLeft !== null && timeLeft < 120 && !isExpired

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500 font-inter">
        Cargando pago USDT...
      </div>
    )

  if (error || !pago)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-red-600 font-medium text-center">{error ?? 'Pago no encontrado'}</p>
        <a
          href="/cobros-suscripciones"
          className="bg-stone-800 text-white px-6 py-2 rounded-lg font-medium text-sm"
        >
          Ver planes
        </a>
      </div>
    )

  return (
    <main className={`min-h-screen font-sans pb-16 transition-colors ${isUrgent ? 'bg-red-50' : 'bg-stone-50'}`}>
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Stepper />
          <span className="text-sm text-stone-400 hidden sm:block">PropBol Inmobiliaria</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Checkout · Pago por USDT TRC20</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 flex flex-col lg:flex-row gap-6 mt-2">
        {/* LEFT */}
        <div className="flex-1 space-y-4">
          {/* Amount header */}
          <div className="text-center py-4">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Monto a transferir</p>
            <p className={`text-5xl font-bold leading-none font-mono ${isUrgent ? 'text-red-700' : 'text-stone-900'}`}>
              {pago.totalUsdt.toFixed(4)}
            </p>
            <p className="text-lg text-stone-500 mt-1">USDT</p>
            <p className="text-sm text-stone-400 mt-1">
              ≈ Bs. {pago.totalBob.toFixed(2)} · Tipo de cambio: {pago.bob_per_usdt} BOB/USDT
            </p>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center justify-between px-5 py-3 rounded-xl transition-colors ${
              isExpired
                ? 'bg-red-100 border border-red-300'
                : isUrgent
                ? 'bg-red-100 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className={isUrgent || isExpired ? 'text-red-600' : 'text-stone-400'} />
              <span className={`text-sm ${isUrgent || isExpired ? 'text-red-700' : 'text-stone-600'}`}>
                {isExpired ? 'Tiempo agotado — transacción cancelada' : 'Tiempo para completar el pago'}
              </span>
            </div>
            <span
              className={`text-2xl font-mono font-bold tabular-nums ${
                isUrgent || isExpired ? 'text-red-700' : 'text-amber-600'
              }`}
            >
              {fmt(timeLeft ?? 0)}
            </span>
          </div>

          {isExpired ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-stone-800 mb-1">Tiempo agotado</p>
              <p className="text-sm text-stone-500 mb-4">La transacción fue cancelada automáticamente.</p>
              <a
                href="/cobros-suscripciones"
                className="inline-block bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
              >
                Elegir otro plan
              </a>
            </div>
          ) : (
            <>
              {/* Wallet */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
                <p className="text-sm font-semibold text-stone-800">Dirección de billetera (TRC20)</p>
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
                  <span className="flex-1 font-mono text-xs text-stone-700 break-all select-all">
                    {pago.walletAddress}
                  </span>
                  <button
                    onClick={() => copyText(pago.walletAddress, 'wallet')}
                    className="shrink-0 text-stone-400 hover:text-amber-600 transition"
                    title="Copiar dirección"
                  >
                    {copied === 'wallet' ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>Envía únicamente en la red <strong>TRON (TRC20)</strong>. Otras redes causarán pérdida de fondos.</span>
                </div>
              </div>

              {/* Monto exacto */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
                <p className="text-sm font-semibold text-stone-800">Monto exacto a enviar</p>
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
                  <span className="flex-1 font-mono text-sm text-stone-700">
                    {pago.totalUsdt.toFixed(4)} USDT
                  </span>
                  <button
                    onClick={() => copyText(String(pago.totalUsdt.toFixed(4)), 'amount')}
                    className="shrink-0 text-stone-400 hover:text-amber-600 transition"
                    title="Copiar monto"
                  >
                    {copied === 'amount' ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-stone-400">
                  Envía el monto exacto. Diferencias pueden retrasar la verificación.
                </p>
              </div>

              {/* Verificar TX */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
                <p className="text-sm font-semibold text-stone-800">Verificar transacción</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Una vez completada la transferencia, ingresa el hash de tu transacción (TX ID) para verificarla automáticamente en la red Shasta.
                </p>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Ej: 4a3b2c1d0e9f8a7b..."
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                {resultadoVerif && (
                  <div
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                      resultadoVerif.ok
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {resultadoVerif.ok ? (
                      <CheckCircle size={15} className="mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    )}
                    <span>{resultadoVerif.msg}</span>
                  </div>
                )}

                <button
                  onClick={verificarTx}
                  disabled={verificando || !txHash.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  {verificando ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {verificando ? 'Verificando en la red...' : 'Verificar pago'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT sidebar */}
        <div className="w-full lg:w-72 space-y-4 shrink-0">
          {/* Resumen */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-stone-800 mb-4 text-sm">Resumen del pago</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-700">
                <span>{pago.planNombre}</span>
                <span>Bs. {pago.totalBob.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tipo de cambio</span>
                <span>{pago.bob_per_usdt} BOB/USDT</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Red</span>
                <span>{pago.red}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-amber-600">
                <span>Total USDT</span>
                <span>{pago.totalUsdt.toFixed(4)} USDT</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-800">Red TRC20 (TRON)</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Usa únicamente la red TRON TRC20 para enviar USDT. Si usas BEP20 (Binance), ERC20 (Ethereum) u otra red, los fondos se perderán permanentemente.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
            <p className="text-sm font-semibold text-stone-800">Referencia</p>
            <p className="font-mono text-sm text-stone-600">{pago.referencia}</p>
            <p className="text-xs text-stone-400">Guarda esta referencia en caso de consulta.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
