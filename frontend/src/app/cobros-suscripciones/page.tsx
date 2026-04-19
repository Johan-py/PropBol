"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: number;
  name: string;
  price: number;
  description: string;
  comment: string;
  benefits: string[];
  subscribers: number;
};

const plansData: Plan[] = [
  {
    id: 1,
    name: "Básico",
    price: 0,
    description: "Ideal para comenzar",
    comment:
      "Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.",
    benefits: [
      "3 publicaciones activas",
      "Acceso limitado",
      "Soporte básico",
      "1 usuario",
    ],
    subscribers: 25,
  },
  {
    id: 2,
    name: "Estándar",
    price: 99,
    description: "Para usuarios intermedios",
    comment:
      "La opción más elegida para empresas pequeñas: balance perfecto entre funciones y precio.",
    benefits: [
      "10 publicaciones activas",
      "Acceso completo",
      "Soporte prioritario",
      "5 usuarios",
    ],
    subscribers: 60,
  },
  {
    id: 3,
    name: "Pro",
    price: 199,
    description: "Máximo rendimiento",
    comment:
      "Todo incluido, ideal para usuarios avanzados o empresas que buscan máximo rendimiento.",
    benefits: [
      "Publicaciones ilimitadas",
      "Todo incluido",
      "Soporte 24/7",
      "Usuarios ilimitados",
    ],
    subscribers: 10,
  },
];

export default function CobrosSuscripciones() {
  const [plans] = useState(plansData);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        const response = await fetch("/api/suscripcion/actual");

        if (!response.ok) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        const data = await response.json();

        setIsLoggedIn(data.isLoggedIn);

        if (data.isLoggedIn && !data.currentPlanId) {
          setCurrentPlanId(1);
        } else {
          setCurrentPlanId(data.currentPlanId);
        }
      } catch (error) {
        console.error("Error obteniendo suscripción:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setMessage("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const maxSubscribers = Math.max(...plans.map((p) => p.subscribers));

  const mostPopularId = plans.find(
    (p) => p.subscribers === maxSubscribers
  )?.id;

  const handleSubscribe = (plan: Plan) => {
    if (!isLoggedIn) {
      setMessage(
        "Debes iniciar sesión o registrarte para suscribirte a un plan."
      );
      return;
    }

    setMessage("");

    router.push(`/pago/resumen?planId=${plan.id}&precio=${plan.price}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-600">
        Cargando planes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex justify-center p-10 font-inter">
      <div className="w-full max-w-6xl">
        <div className="mb-10">
          {message && (
            <div
              ref={notificationRef}
              className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-amber-50 px-4 py-4 text-sm text-orange-700 shadow-sm"
            >
              <span>{message}</span>

              <button className="rounded-xl bg-amber-500 px-4 py-2 text-white transition hover:bg-orange-700">
                Iniciar sesión
              </button>
            </div>
          )}

          <h1 className="text-4xl font-bold text-stone-900">
            Planes de membresía
          </h1>

          <p className="text-stone-400 mt-2 text-lg">
            Amplía tu alcance en el mercado inmobiliario de Bolivia.
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
                ${
                  plan.id === mostPopularId
                    ? "border-amber-400 shadow-lg"
                    : ""
                }
              `}
            >
              {plan.id === mostPopularId && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow">
                  MÁS POPULAR
                </div>
              )}

              {plan.id === currentPlanId && (
                <div className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Plan actual
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                  {plan.name}
                </h2>

                <p className="text-3xl font-bold text-amber-600 mb-2">
                  {plan.price === 0 ? "Gratis" : `Bs. ${plan.price}`}
                  <span className="text-sm text-stone-500"> / mes</span>
                </p>

                <p className="text-sm text-stone-600 mb-4">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <span className="text-green-500 font-bold">✔</span>
                    {b}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-stone-500 mb-4">{plan.comment}</p>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={plan.id === currentPlanId}
                className={`
                  p-2 rounded-xl text-white transition
                  ${
                    plan.id === currentPlanId
                      ? "bg-stone-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
                  }
                `}
              >
                {plan.id === currentPlanId
                  ? "Tu plan actual"
                  : "Suscribirse"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
