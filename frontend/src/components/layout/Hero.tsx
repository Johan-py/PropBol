"use client" // Lo mismo aquí, necesitamos que sea un componente de cliente

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePublicarClick = () => {
    if (isLoading) return
    setIsLoading(true)
    router.push('/login')
    
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <section className="relative flex flex-col items-center justify-center w-full py-24 bg-gray-900 text-white overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Encuentra o publica <br/> 
          <span className="text-orange-500">tu próximo inmueble</span>
        </h1>
        
        <p className="text-gray-300 text-lg mb-8 max-w-2xl">
          Únete a la plataforma inmobiliaria más confiable. Conecta directamente con compradores o encuentra la casa de tus sueños.
        </p>

        {/* Cambiamos el <Link> anterior por un <button> para poder controlar los clics */}
        <button 
          onClick={handlePublicarClick}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          } px-6 py-3 mb-12 text-white rounded-md font-medium flex items-center gap-2 transition`}
        >
          {isLoading ? 'Procesando...' : 'Publicar propiedad \u2192'}
        </button>

        <div className="flex flex-col md:flex-row items-center w-full max-w-3xl bg-white rounded-md p-2 shadow-lg gap-2">
          <div className="flex items-center flex-grow w-full px-2">
            <span className="text-gray-400 mr-2">📍</span>
            <input 
              type="text" 
              placeholder="¿Dónde quieres vivir?" 
              className="w-full p-2 text-gray-800 outline-none bg-transparent"
            />
          </div>
          <button className="w-full md:w-auto px-8 py-3 text-black font-semibold bg-gray-100 rounded hover:bg-gray-200 transition">
            🔍 Buscar
          </button>
        </div>

      </div>
    </section>
  )
}