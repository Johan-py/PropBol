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
<<<<<<< HEAD
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 to-black border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow mb-4">
          No pudimos cargar tu información, intenta de nuevo
=======
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87B00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu panel de consumo...</p>
>>>>>>> 428f0c63f296c0c0b1624c61a12c4c067895b7d8
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
<<<<<<< HEAD
      <div className="min-h-screen bg-gray-100 p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">

          {/*Texto: Título y Subtítulo */}
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tighter">Panel de consumo</h1>
            <p className="text-xl md:text-2xl font-extrabold text-stone-500 mt-5">Monitorea tus publicaciones activas y el límite de tu plan</p>
          </div>
          <Link href="/cobros-suscripciones">

              {/*Botón para redirigir a Planes de Suscripción */}
              <button className="mt-6 group flex items-center gap-3 bg-gradient-to-r from-black from-20% via-orange-950 to-orange-400 text-white px-10 py-5 text-xl font-extrabold rounded-lg hover:bg-orange-800 transition">
              Ver planes de ampliación
              <span className="text-3x1 transition-transform group-hover:translate-x-2">→</span>
              </button>
          </Link>
        </div>

      {/*  MENSAJE SI NO SE INICIO SESION */}
      {!isLogged && ( 
        <div className="mt-16 group flex items-center gap-3 bg-gradient-to-r from-black to-orange-400 text-white p-4 rounded-lg mb-6  justify-between ">
          <span className="text-xl font-extrabold">Primero debe inicia sesión para ver su consumo</span>
          <Link href="/sign-in">
            <button className="bg-black text-white px-10 py-4 text-xl font-extrabold rounded-lg">Iniciar Sesión</button>
          </Link>
        </div>
      )}

      {/* SOLO SI ESTÁ LOGUEADO */}
      {/*Muestra el contador de publicaciones dinámicamente */}
      {isLogged && (
        <div className="bg-[#FFFBEB] border border-yellow-200 p-5 rounded-2xl mb-6 flex items-center gap-4 shadow-sm">

          {/* Icono de Campana */}
          <div className="text-5xl">🔔</div>

          {/* Titulo:Publicaciones */}
          <div className="flex-1">
            <h3 className="text-yellow-900 text-[1.75rem] font-extrabold  leading-tight">
              Tienes Publicaciones Restantes este Mes
            </h3>
            <p className="text-yellow-700 text-lg md:text-base font-extrabold">
              Tu Plan Pro incluye 10 publicaciones. Has utilizado {10-disponibles} y te queda <span className="underline font-extrabold">{disponibles} disponible</span>. ¡Úsala antes de que venza el periodo mensual!
            </p>
          </div>

          {/* Numero de la derecha*/}
          <div className="text-6xl md:text-8xl font-black text-yellow-900">
            {disponibles}
          </div>
        </div>
      )}

      {/* Tarjeta Principal */}
      <div className="bg-gradient-to-r from-black via-stone-900 to-orange-600 text-white p-8 rounded-[2rem] shadow-2xl mt-16 mb-20 font-sans">
        {/* Titulo:Publicaciones */}
        <p className="text-[20px] tracking-[0.2em] opacity-60 font-black mb-6 uppercase">
          Publicaciones usadas este mes
        </p>

        {/* Contador de Publicaciones */}
        <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8">
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-8xl font-black">{data.usadas}</span>
              <span className="text-5xl opacity-30 font-light">/ {data.limite}</span>
            </div>
            <p className="text-xl opacity-50 mt-1 font-medium">Plan Pro • Límite mensual</p>
          </div>

          {/* Emcabezado de la Barra */}
          <div className="flex-1 pb-2">
            <div className="flex justify-between text-[10px] font-black mb-2 tracking-widest">
              <span className="text-xl opacity-70">{data.usadas} USADAS</span>
              <span className="text-xl text-orange-400">{porcentaje}% UTILIZADO</span>
              <span className="text-xl">LÍMITE: {data.limite}</span>
            </div>
            
            {/* Barra de Progreso */}
            <div className="w-full bg-white/40 rounded-full h-6 overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${colorBarra}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Creacion de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-28 mb-10">
        <div className="bg-white p-10 rounded-3xl shadow-sm border-b-8 border-emerald-500 flex items-center justify-center gap-6 transition-transform hover:scale-105">
          
          {/* Icono libro verde */}
          <div className="bg-emerald-50 p-4 rounded-2xl text-5xl">📗</div>
          
          {/* Texto del Cards1 */}
          <div className="flex flex-col text-left">
            <h3 className="text-6xl font-black text-emerald-600 leading-none">
              {isLogged ? disponibles : 0}
            </h3>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-2">
              Publicaciones Disponibles
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-b-8 border-amber-500 flex items-center justify-center gap-6 transition-transform hover:scale-105">
          
          {/* Icono libro ambar */}
          <div className="bg-amber-50 p-4 rounded-2xl text-5xl">📙</div>

          {/* Texto del Cards2 */}
          <div className="flex flex-col text-left">
            <h3 className="text-6xl font-black text-amber-600 leading-none">
              {data.usadas}
            </h3>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-2">
              Publicaciones Utilizadas
            </p>
          </div>    
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border-b-8 border-blue-500 flex items-center justify-center gap-6 transition-transform hover:scale-105">
          
          {/* Icono libro azul */}
          <div className="bg-blue-50 p-4 rounded-2xl text-5xl">📘</div>

          {/* Texto del Cards3 */}
          <div className="flex flex-col text-left">
            <h3 className="text-6xl font-black text-blue-600 leading-none">
              {data.limite}
            </h3>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-widest mt-2">
              Límite Total del Plan
            </p>
          </div>
      </div>
      </div>

      {/* ALERTA SI LLEGÓ AL LÍMITE */}
      {isLogged && data.usadas >= data.limite && data.limite > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>Sin cupo restante</span>
          <Link href="/cobros-suscripciones">
            <button className="bg-gradient-to-r from-black to-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-900 transition">
              Ampliar plan
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
=======
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Panel de consumo
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Monitorea tus publicaciones activas y el límite de tu plan
            </p>
          </div>

          <div className="flex items-center gap-3">
            {data.plan && (
              <span className="bg-[#4B4B4B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                {data.plan}
              </span>
            )}
            <Link href="/cobros-suscripciones">
              <button className="bg-[#E87B00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">
                Ver planes de ampliación
              </button>
            </Link>
          </div>
        </div>

        {/* NOTIFICACIÓN PUBLICACIONES RESTANTES */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 flex items-center gap-3">
          <Zap size={18} className="text-yellow-600 shrink-0" />
          <span className="text-sm">
            Tienes publicaciones restantes este mes. Te quedan{" "}
            <strong>{disponibles}</strong>.
          </span>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-gradient-to-r from-black to-[#E87B00] text-white p-6 rounded-xl shadow mb-6">
          <p className="text-sm opacity-70 mb-2 uppercase tracking-wide">
            Publicaciones usadas este mes
          </p>

          <h2 className="text-4xl font-bold mb-4">
            {data.usadas}{" "}
            <span className="text-2xl opacity-70">/ {data.limite}</span>
          </h2>

          {/* BARRA DE PROGRESO */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${colorBarra}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold opacity-90">{mensaje}</p>
            <p className="text-sm opacity-70">{Math.round(porcentaje)}% utilizado</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-blue-500" size={22} />
            <h3 className="text-blue-600 text-2xl font-bold">{disponibles}</h3>
            <p className="text-gray-500 text-sm mt-1">Disponibles</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-green-500" size={22} />
            <h3 className="text-green-600 text-2xl font-bold">{data.usadas}</h3>
            <p className="text-gray-500 text-sm mt-1">Usadas</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-[#E87B00]" size={22} />
            <h3 className="text-[#E87B00] text-2xl font-bold">{data.limite}</h3>
            <p className="text-gray-500 text-sm mt-1">Límite mensual</p>
          </div>
        </div>

        {/* ALERTA LÍMITE ALCANZADO */}
        {limitado && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="text-sm font-medium">
                Has alcanzado el límite de publicaciones de tu plan actual.
              </span>
            </div>
            <Link href="/cobros-suscripciones">
              <button className="bg-[#E87B00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap">
                Ampliar plan
              </button>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
>>>>>>> 428f0c63f296c0c0b1624c61a12c4c067895b7d8
