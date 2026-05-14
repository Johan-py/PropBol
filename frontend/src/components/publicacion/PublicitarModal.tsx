'use client'

import { useState } from 'react'
import { publicacionService } from '@/services/publicacionn.service'

const PLANES = [
  {
    id: 'basico',
    nombre: 'Plan Básico',
    desc: '30 días destacado · Posición prioritaria',
    precio: '9.99',
    dias: 30,
    popular: true
  },
  {
    id: 'premium',
    nombre: 'Plan Premium',
    desc: '60 días · Banner especial · Top 3 resultados',
    precio: '19.99',
    dias: 60,
    popular: false
  }
]

type Paso = 'planes' | 'procesando' | 'exito'

interface Props {
  abierto: boolean
  publicacionId: number
  tituloPub: string
  onCerrar: () => void
  onExito: (planNombre: string, dias: number) => void
}

export default function PublicitarModal({ abierto, publicacionId, tituloPub, onCerrar, onExito }: Props) {
  const [paso, setPaso] = useState<Paso>('planes')
  const [planSeleccionado, setPlanSeleccionado] = useState(PLANES[0])
  const [pasosPago, setPasosPago] = useState<('idle' | 'activo' | 'done')[]>(['idle', 'idle', 'idle'])

  if (!abierto) return null

  const iniciarPago = async () => {
    setPaso('procesando')
    setPasosPago(['activo', 'idle', 'idle'])

    await new Promise(r => setTimeout(r, 700))
    setPasosPago(['done', 'activo', 'idle'])

    await new Promise(r => setTimeout(r, 700))
    setPasosPago(['done', 'done', 'activo'])

    await publicacionService.publicitar(publicacionId, planSeleccionado.id)

    setPasosPago(['done', 'done', 'done'])
    await new Promise(r => setTimeout(r, 400))
    setPaso('exito')
  }

  const cerrarYReiniciar = () => {
    setPaso('planes')
    setPlanSeleccionado(PLANES[0])
    setPasosPago(['idle', 'idle', 'idle'])
    onCerrar()
  }

  const confirmarExito = () => {
    const plan = planSeleccionado
    cerrarYReiniciar()
    onExito(plan.nombre, plan.dias)
  }

  const pasoLabels = [
    'Validando información...',
    'Procesando transacción...',
    'Activando publicidad...'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl">

        {/* Paso 1: Selección de plan */}
        {paso === 'planes' && (
          <>
            <div className="px-6 py-4 text-center">
              <div className="mb-1 text-3xl">🚀</div>
              <h2 className="text-lg font-semibold text-gray-800">Publicitar propiedad</h2>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                Elige un plan para destacar "{tituloPub}"
              </p>
            </div>

            <hr className="h-[2px] bg-gray-200" />

            <div className="px-4 py-4 space-y-3">
              {PLANES.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanSeleccionado(plan)}
                  className={`relative w-full rounded-xl border-2 p-4 text-left transition ${
                    planSeleccionado.id === plan.id
                      ? 'border-[#D97706] bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2 left-3 rounded-full bg-[#D97706] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Más popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{plan.nombre}</p>
                      <p className="text-xs text-gray-500">{plan.desc}</p>
                    </div>
                    <span className="text-lg font-extrabold text-[#D97706]">${plan.precio}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 px-4 pb-5">
              <button
                type="button"
                onClick={cerrarYReiniciar}
                className="h-11 flex-1 rounded-lg border border-[#9a9a9a] bg-white text-sm font-medium text-[#2c2c2c] transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={iniciarPago}
                className="h-11 flex-1 rounded-lg bg-[#D97706] text-sm font-medium text-white transition hover:bg-[#bf6905]"
              >
                Continuar al pago
              </button>
            </div>
          </>
        )}

        {/* Paso 2: Procesando pago */}
        {paso === 'procesando' && (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#D97706]" />
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Procesando pago</h2>
            <div className="space-y-2">
              {pasoLabels.map((label, i) => (
                <p
                  key={label}
                  className={`text-sm transition-colors ${
                    pasosPago[i] === 'done'
                      ? 'font-medium text-green-600'
                      : pasosPago[i] === 'activo'
                        ? 'font-semibold text-[#D97706]'
                        : 'text-gray-400'
                  }`}
                >
                  {pasosPago[i] === 'done' ? '✓' : '✦'} {label}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Éxito */}
        {paso === 'exito' && (
          <>
            <div className="px-6 py-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-2xl text-white shadow-lg">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-gray-800">¡Pago exitoso!</h2>
              <p className="mt-1 text-sm text-gray-500">Tu propiedad ahora es destacada.</p>
            </div>

            <hr className="h-[2px] bg-gray-200" />

            <div className="px-4 py-4 space-y-2 text-sm text-gray-600">
              <p>⭐ Aparecerá en los primeros resultados de búsqueda</p>
              <p>📅 La publicidad estará activa por {planSeleccionado.dias} días</p>
              <p>📊 Podrás ver sus estadísticas en la pestaña "Publicidad"</p>
            </div>

            <div className="px-4 pb-5">
              <button
                type="button"
                onClick={confirmarExito}
                className="h-11 w-full rounded-lg bg-[#D97706] text-sm font-medium text-white transition hover:bg-[#bf6905]"
              >
                Ver mis publicaciones destacadas
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
