'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ConsumoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<any>(null)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    // NO LOGUEADO
    if (!token) {
      setIsLogged(false)
      setData({
        usadas: 0,
        limite: 0,
        plan: ''
      })
      setLoading(false)
      return
    }

    // LOGUEADO
    setIsLogged(true)

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/consumo/1')

        if (!res.ok) {
          throw new Error('Error en la API')
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
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
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const porcentaje = data.limite > 0 ? (data.usadas / data.limite) * 100 : 0
  const disponibles = data.limite - data.usadas

  let colorBarra = 'bg-green-500'
  let colorTexto = 'text-green-600'
  let mensaje = 'Consumo normal'

  if (data.usadas >= data.limite && data.limite > 0) {
    colorBarra = 'bg-red-500'
    colorTexto = 'text-red-600'
    mensaje = 'Límite alcanzado'
  } else if (data.usadas >= 5) {
    colorBarra = 'bg-yellow-400'
    colorTexto = 'text-yellow-600'
    mensaje = 'Casi sin cupo disponible'
  }

  return (
      <div className="min-h-screen bg-gray-100 p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">

          {/*Texto: Título y Subtítulo */}
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tighter">Panel de consumo</h1>
            <p className="text-xl md:text-2xl font-extrabold text-stone-500 mt-2">Monitorea tus publicaciones activas y el límite de tu plan</p>
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
        <div className="mt-6 group flex items-center gap-3 bg-gradient-to-r from-black to-orange-400 text-white p-4 rounded-lg mb-6  justify-between ">
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
      <div className="bg-gradient-to-r from-black via-stone-900 to-orange-600 text-white p-8 rounded-[2rem] shadow-2xl mb-8 font-sans">
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
              <span className="text-xl opacity-70">0 USADAS</span>
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
          
          {/* Linea de color verde inferior y texto del Cards1 */}
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

          {/* Linea de color ambar inferior y texto del Cards2 */}
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
              Límite Total del Pla
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