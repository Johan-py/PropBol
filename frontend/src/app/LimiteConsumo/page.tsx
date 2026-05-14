'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ConsumoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      //No inicio sesion
      if (!token) {
        setIsLogged(false);
        setData({
          usadas: 0,
          limite: 0,
          plan: null,
        });
        setLoading(false);
        return;
      }

      // LOGUEADO
      setIsLogged(true);

      try {
        const res = await fetch("http://localhost:5000/api/consumo/1", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Error en la API')
        }

        const json = await res.json();
        setData(json);
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
        <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
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

  const porcentaje =
    data.limite > 0 ? (data.usadas / data.limite) * 100 : 0;

  const disponibles = data.limite - data.usadas;

  let colorBarra = 'bg-green-500'
  let colorTexto = 'text-green-600'
  let mensaje = 'Consumo normal'

  if (data.usadas >= 9) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de consumo</h1>
        <Link href="/cobros-suscripciones">
          <button className="bg-gradient-to-r from-black to-orange-400 text-white px-4 py-2 rounded-lg">
            Ver planes de ampliación
          </button>
        </Link>
      </div>

      {/* 🔥 MENSAJE SI NO ESTÁ LOGUEADO */}
      {!isLogged && (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg flex justify-between items-center mb-6">
          <span>Primero inicia sesión para ver tu consumo</span>
          <Link href="/login">
            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Iniciar sesión
            </button>
          </Link>
        </div>
      )}

      {/* MENSAJE NORMAL */}
      {isLogged && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          Te quedan {disponibles} publicaciones disponibles este mes.
        </div>
      )}

      {/* TARJETA */}
      <div className="bg-gradient-to-r from-black to-orange-500 text-white p-6 rounded-xl shadow mb-6">
        <p className="text-sm opacity-80 mb-2">
          PUBLICACIONES USADAS ESTE MES
        </p>

        <h2 className="text-4xl font-bold mb-4">
          {data.usadas} / {data.limite}
        </h2>

        <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full ${colorBarra}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <p className={`text-sm font-semibold ${colorTexto}`}>
          {isLogged ? mensaje : "Sin datos"}
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-green-600 text-xl font-bold">
            {isLogged ? disponibles : "-"}
          </h3>
          <p>Disponibles</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-orange-600 text-xl font-bold">
            {isLogged ? data.usadas : "-"}
          </h3>
          <p>Usadas</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-blue-600 text-xl font-bold">
            {isLogged ? data.limite : "-"}
          </h3>
          <p>Límite</p>
        </div>
      </div>

      {/* SIN CUPO */}
      {isLogged && data.usadas >= data.limite && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>Sin cupo restante</span>
          <Link href="/cobros-suscripciones">
            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Ampliar plan
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
