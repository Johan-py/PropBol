'use client'

<<<<<<< HEAD
import { useState } from 'react'
=======
import { useEffect, useState } from 'react'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
import { useRouter } from 'next/navigation'

type Plan = {
  id: number
  name: string
  price: number
  description: string
  comment: string
  benefits: string[]
  subscribers: number
}

const plansData: Plan[] = [
  {
    id: 1,
    name: 'Básico',
<<<<<<< HEAD
    price: 59,
    description: 'Ideal para comenzar',
    comment: 'Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.',
    benefits: ['Acceso limitado', 'Soporte básico', '1 usuario'],
=======
    price: 0,
    description: 'Ideal para comenzar',
    comment: 'Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.',
    benefits: ['3 publicaciones activas', 'Acceso limitado', 'Soporte basico', '1 usuario'],
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    subscribers: 25
  },
  {
    id: 2,
    name: 'Estándar',
    price: 99,
    description: 'Para usuarios intermedios',
    comment:
<<<<<<< HEAD
      'La opción más elegida para empresas pequeñas: balance perfecto entre funciones y precio.',
    benefits: ['Acceso completo', 'Soporte prioritario', '5 usuarios'],
=======
      'La opcion mas elegida para empresas pequeñas: balance perfecto entre funciones y precio.',
    benefits: ['10 publicaciones activas', 'Acceso completo', 'Soporte prioritario', '5 usuarios'],
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    subscribers: 60
  },
  {
    id: 3,
    name: 'Pro',
    price: 199,
<<<<<<< HEAD
    description: 'Máximo rendimiento',
    comment:
      'Todo incluido, ideal para usuarios avanzados o empresas que buscan máximo rendimiento.',
    benefits: ['Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados'],
=======
    description: 'Maximo rendimiento',
    comment:
      'Todo incluido, ideal para usuarios avanzados o empresas que buscan maximo rendimiento.',
    benefits: ['Publicaciones ilimitadas', 'Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados'],
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    subscribers: 10
  }
]

export default function CobrosSuscripciones() {
  const [plans] = useState(plansData)
<<<<<<< HEAD
  const maxSubscribers = Math.max(...plans.map((plan) => plan.subscribers))
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-10 font-inter">
      <h1 className="text-4xl font-bold text-stone-900 mb-10">Planes de Suscripción</h1>
=======
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true)
    }
  }, [])

  const maxSubscribers = Math.max(...plans.map((p) => p.subscribers))
  const mostPopularId = plans.find((p) => p.subscribers === maxSubscribers)?.id

  const currentPlanId = 1

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
    <div className="min-h-screen bg-stone-50 flex justify-center p-10 font-inter">
      <div className="w-full max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-stone-900">Planes de membresía</h1>
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

          <p className="text-stone-400 mt-2 text-lg">
            Amplia tu alcance en el mercado inmobiliario de Bolivia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative p-6 w-80 flex flex-col justify-between
                rounded-3xl border transition-all duration-300
                bg-white border-stone-200
                hover:bg-amber-50
                hover:border-amber-400
                hover:shadow-2xl
                hover:-translate-y-1
                ${plan.id === mostPopularId ? 'border-amber-400 shadow-lg' : ''}
              `}
            >
              {plan.id === mostPopularId && (
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

<<<<<<< HEAD
            <div>
              <h2 className="text-3xl font-semibold text-stone-900 mb-2">{plan.name}</h2>
=======
              <ul className="space-y-2 mb-4">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-700">
                    <span className="text-green-500 font-bold">✔</span>
                    {b}
                  </li>
                ))}
              </ul>
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

              <p className="text-sm text-stone-500 mb-4">{plan.comment}</p>

<<<<<<< HEAD
              <p className="text-base text-stone-600 mb-4">{plan.description}</p>
            </div>

            <ul className="mb-2 space-y-1 pl-4">
              {plan.benefits.map((b, i) => (
                <li key={i} className="text-base text-stone-600 list-disc">
                  {b}
                </li>
              ))}
            </ul>

            <p className="text-base text-stone-600 mb-4">{plan.comment}</p>

            <div className="flex flex-col gap-2 mt-auto">
=======
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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
      </div>
    </div>
  )
}
//// autenticado
