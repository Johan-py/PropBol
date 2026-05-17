"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart2, Zap, AlertTriangle } from "lucide-react";

type ConsumoData = {
  usadas: number;
  limite: number;
  plan: string;
};

export default function LimiteConsumoPage() {
  const router = useRouter();
  const [data, setData] = useState<ConsumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchConsumo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/consumo/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/sign-in");
            return;
          }
          throw new Error(`Error ${response.status}`);
        }

        const json: ConsumoData = await response.json();
        setData(json);
      } catch (err) {
        console.error("Error cargando consumo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumo();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87B00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu panel de consumo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow mb-4">
            No pudimos cargar tu información, intenta de nuevo
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  const porcentaje = data.limite > 0 ? (data.usadas / data.limite) * 100 : 0;
  const disponibles = data.limite - data.usadas;
  const limitado = data.usadas >= data.limite && data.limite > 0;
  let colorBarra = "bg-green-500";
  let mensaje = "Consumo normal";

  if (limitado) {
    colorBarra = "bg-red-500";
    mensaje = "Límite alcanzado";
  } else if (porcentaje >= 80) {
    colorBarra = "bg-yellow-400";
    mensaje = "Casi sin cupo disponible";
  }
  return (
    <main className="min-h-screen bg-[#F4F7FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900">
                Panel de consumo
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Monitorea tus publicaciones activas y el límite de tu plan
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data.plan && (
              <span className="bg-[#4B4B4B] text-white text-xs font-bold italic px-3 py-1.5 rounded-full shadow-sm">
                {data.plan}
              </span>
            )}
            <Link href="/cobros-suscripciones">
              <button className="bg-[#ff8800] text-white px-4 py-2 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-colors">
                Ver planes de ampliación
              </button>
            </Link>
          </div>
        </div>

        {/* NOTIFICACIÓN PUBLICACIONES RESTANTES */}
        <div className="bg-amber-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-4 flex items-center gap-3">
          <Zap size={18} className="text-yellow-600 shrink-0" />
          <span className="text-xl font-medium">
            Tienes publicaciones restantes este mes. Te quedan{" "}
            <strong>{disponibles}</strong>.
          </span>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-gradient-to-r from-black to-[#E87B00] text-white p-6 rounded-3xl shadow mb-6">
          <p className="text-xl opacity-85 mb-2 uppercase tracking-widest">
            Publicaciones usadas este mes
          </p>

          <h2 className="text-5xl font-bold mb-6">
            {data.usadas}{" "}
            <span className="text-2xl opacity-70">/ {data.limite}</span>
          </h2>
          {/* BARRA DE PROGRESO */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${colorBarra}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm font-semibold opacity-90">{mensaje}</p>
            <p className="text-2xl opacity-70">{Math.round(porcentaje)}% utilizado</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* Card 1: Publicaciones Disponibles */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-b-8 border-emerald-500 flex items-center gap-5 transition-all duration-500 hover:scale-105">
            <div className="bg-emerald-50 p-3 rounded-xl text-5xl">📗</div>
            <div className="flex flex-col text-left">
              <h3 className="text-5xl font-black text-emerald-600 leading-none">
                {disponibles}
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
                Publicaciones Disponibles
              </p>
            </div>
          </div>

                  {/* Card 2: Usadas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-[10px] border-amber-500 flex items-center gap-5 transition-transform hover:scale-105">
            <div className="bg-amber-100 p-3 rounded-xl text-4xl">📙</div>
            <div className="flex flex-col text-left">
              <h3 className="text-5xl font-black text-amber-600 leading-none">
                {data.usadas}
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                Publicaciones Utilizadas
              </p>
            </div>
          </div>

          {/* Card 3: Límite */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-8 border-blue-500 flex items-center gap-5 transition-transform hover:scale-105">
            <div className="bg-blue-50 p-3 rounded-xl text-4xl">📘</div>
            <div className="flex flex-col text-left">
              <h3 className="text-5xl font-black text-blue-600 leading-none">
                {data.limite}
              </h3>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-1">
                Límite Total del Plan
              </p>
            </div>
          </div>
        </div>

        {/* ALERTA LÍMITE ALCANZADO */}
        {limitado && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0 text-red-600" />
              <span className="text-sm font-medium">
                Has alcanzado el límite de publicaciones de tu plan actual.
              </span>
            </div>
            <Link href="/cobros-suscripciones">
              <button className="bg-[#ff8800] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap">
                Ampliar plan
              </button>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}