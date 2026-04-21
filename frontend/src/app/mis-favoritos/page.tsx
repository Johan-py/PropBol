'use client'
import { useEffect, useState } from 'react'

type Favorito = {
  id: number
  titulo: string
  precio: string
}

export default function MisFavoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([])

  useEffect(() => {
    const data: Favorito[] = [] // vacío por ahora
    setFavoritos(data)
  }, [])

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestión de Favoritos</h1>
          <p className="text-gray-500 text-sm">{favoritos.length} propiedades encontradas</p>
        </div>

        {/* CONTENIDO */}
        {favoritos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            No tienes favoritos aún
          </div>
        ) : (
          <div>{/* Aquí irán las cards después */}</div>
        )}

        {/* PAGINACIÓN */}
        <div className="mt-10 flex justify-center items-center gap-2 pb-10">
          <button className="w-9 h-9 flex items-center justify-center bg-[#E87B00] text-white rounded-md shadow-sm text-sm font-bold">
            1
          </button>

          {[2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
            <button
              key={n}
              className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-all"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
