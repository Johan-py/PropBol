"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  // Revisamos si el usuario tiene una sesión activa al cargar la página
  useEffect(() => {
    const session = localStorage.getItem('userSession')
    if (session === 'activa') {
      setIsLoggedIn(true)
    }
  }, [])

  const handlePublicarClick = () => {
    if (isLoading) return
    setIsLoading(true)
    
    // Criterio de aceptación: Si es Visitor va a Login, si es User va a Publicar
    if (isLoggedIn) {
      router.push('/publicar') // Ruta del formulario que haremos después
    } else {
      router.push('/login')
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  // Función extra para cerrar sesión y probar fácilmente
  const handleLogout = () => {
    localStorage.removeItem('userSession')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="text-xl md:text-2xl font-bold text-orange-500 flex items-center gap-2">
            🏢 <span className="hidden sm:block">InmoWeb</span>
          </Link>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-orange-500 transition font-medium">Inicio</Link>
              <Link href="/buscar" className="text-gray-600 hover:text-orange-500 transition font-medium">Buscar</Link>
              
              {/* Renderizado condicional: ¿Es visitante o usuario? */}
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-800 font-medium flex items-center gap-1">
                    👤 Cuenta
                  </span>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">
                    Salir
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-gray-600 hover:text-orange-500 transition font-medium">
                  Iniciar Sesión
                </Link>
              )}
            </div>

            <button 
              onClick={handlePublicarClick}
              disabled={isLoading}
              className={`${
                isLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              } text-white font-semibold py-2 px-3 md:px-4 rounded text-sm md:text-base transition`}
            >
              {isLoading ? 'Cargando...' : 'Publicar Propiedad'}
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
} 