"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ArrowRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type PlanFromAPI = {
  id: number
  name: string
  price: number
  description: string
  nro_publicaciones: number | null
  duracion_dias: number | null
  popular: boolean
}

type Plan = PlanFromAPI & {
  comment: string
  benefits: string[]
}

const PLAN_COMMENTS: Record<string, string> = {
  'Básico': 'Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.',
  'Estándar': 'La opcion mas elegida para empresas pequeñas: balance perfecto entre funciones y precio.',
  'Pro': 'Todo incluido, ideal para usuarios avanzados o empresas que buscan maximo rendimiento.',
}

const STATIC_PLANS: Plan[] = [
  {
    id: 1, name: 'Básico', price: 0, description: 'Ideal para comenzar',
    nro_publicaciones: 2, duracion_dias: 30, popular: false,
    comment: PLAN_COMMENTS['Básico'],
    benefits: ['2 publicaciones activas', 'Acceso limitado', 'Soporte basico', '1 usuario'],
  },
  {
    id: 2, name: 'Estándar', price: 99, description: 'Para usuarios intermedios',
    nro_publicaciones: 10, duracion_dias: 60, popular: true,
    comment: PLAN_COMMENTS['Estándar'],
    benefits: ['10 publicaciones activas', 'Acceso completo', 'Soporte prioritario', '5 usuarios'],
  },
  {
    id: 3, name: 'Pro', price: 199, description: 'Maximo rendimiento',
    nro_publicaciones: null, duracion_dias: 90, popular: false,
    comment: PLAN_COMMENTS['Pro'],
    benefits: ['Publicaciones ilimitadas', 'Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados'],
  },
]

function buildBenefits(p: PlanFromAPI): string[] {
  const benefits: string[] = []
  if (p.nro_publicaciones === null || p.nro_publicaciones === undefined) {
    benefits.push('Publicaciones ilimitadas')
  } else {
    benefits.push(`${p.nro_publicaciones} publicaciones activas`)
  }
  if (p.duracion_dias) benefits.push(`${p.duracion_dias} días de vigencia`)
  if (p.price === 0) {
    benefits.push('Acceso limitado', 'Soporte básico', '1 usuario')
  } else if (p.price < 150) {
    benefits.push('Acceso completo', 'Soporte prioritario', '5 usuarios')
  } else {
    benefits.push('Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados')
  }
  return benefits
}

export default function CobrosSuscripciones() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const isValidToken = token && token !== 'undefined' && token !== 'null'

    if (isValidToken) {
      setIsLoggedIn(true)

      Promise.all([
        fetch(`${API_URL}/api/planes/membership-plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => (r.ok ? r.json() : Promise.reject())),
        fetch(`${API_URL}/api/suscripciones/mi-suscripcion`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null),
      ])
        .then(([planesData, suscData]: [PlanFromAPI[], any]) => {
          const mapped: Plan[] = planesData.map(p => ({
            ...p,
            comment: PLAN_COMMENTS[p.name] ?? '',
            benefits: buildBenefits(p),
          }))
          setPlans(mapped)
          if (suscData?.activa && typeof suscData.idSuscripcion === 'number') {
            setCurrentPlanId(suscData.idSuscripcion)
          }
        })
        .catch(() => {
          setError(true)
          setPlans(STATIC_PLANS)
        })
        .finally(() => setLoading(false))
    } else {
      setPlans(STATIC_PLANS)
      setLoading(false)
    }
  }, [])

  const handleSubscription = (plan: Plan) => {
    const token = localStorage.getItem('token')
    const url = `/pago/resumen?planId=${plan.id}&precio=${plan.price}`

    if (!token || token === 'undefined' || token === 'null') {
      localStorage.setItem('redirectAfterLogin', '/cobros-suscripciones')
      localStorage.setItem('selectedPlan', JSON.stringify(plan))
      router.push('/sign-in')
      return
    }

    router.push(url)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex justify-center px-4 py-6 sm:p-10 font-inter">
      <div className="w-full max-w-6xl">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900">Planes de membresía</h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-400 mt-2">
            Amplia tu alcance en el mercado inmobiliario de Bolivia.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-3xl border border-stone-200 bg-white p-6 animate-pulse">
                <div className="h-6 bg-stone-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-stone-200 rounded w-2/3 mb-6" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-4 bg-stone-100 rounded w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <p className="text-stone-500 text-lg mb-2">No se pudieron cargar los planes en este momento.</p>
            <p className="text-stone-400 text-sm">Por favor intenta de nuevo más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative p-4 sm:p-6 w-full flex flex-col justify-between
                  rounded-3xl border transition-all duration-300
                  bg-white border-stone-200
                  hover:bg-amber-50
                  hover:border-amber-400
                  hover:shadow-2xl
                  hover:-translate-y-1
                  ${plan.popular ? 'border-amber-400 shadow-lg' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    MÁS POPULAR
                  </div>
                )}

                {isLoggedIn && plan.id === currentPlanId && (
                  <div className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Plan actual
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-semibold text-stone-900 mb-2">{plan.name}</h2>

                  <p className="text-3xl font-bold text-amber-600 mb-2">
                    {plan.price === 0 ? 'Gratis' : `Bs. ${plan.price}`}
                    <span className="text-sm text-stone-500"> / mes</span>
                  </p>

                  <p className="text-sm text-stone-600 mb-4">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-stone-700">
                      <span className="text-green-500 font-bold">✔</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-stone-500 mb-4">{plan.comment}</p>

                <button
                  onClick={() => handleSubscription(plan)}
                  disabled={isLoggedIn && plan.id === currentPlanId}
                  className={`
                    p-2 rounded-xl text-white transition
                    ${
                      isLoggedIn && plan.id === currentPlanId
                        ? 'bg-stone-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }
                  `}
                >
                  {isLoggedIn && plan.id === currentPlanId
                    ? 'Tu plan actual'
                    : 'Suscribirse'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Banner de Suscripciones Anuales */}
        <div className="mt-12 p-4 sm:p-6 rounded-3xl bg-amber-50/50 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-amber-100">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Tu suscripción actual</h3>
              <p className="text-stone-600 text-sm max-w-md">
                Revisa cuántas publicaciones has usado este mes y el límite de tu plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/LimiteConsumo')}
            className="whitespace-nowrap px-8 py-3 bg-white border-2 border-amber-600/20 text-amber-700 rounded-2xl hover:bg-amber-100 hover:border-amber-600/40 transition-all font-bold flex items-center gap-2 shadow-sm active:scale-95"
          >
            Ir al panel de consumo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
