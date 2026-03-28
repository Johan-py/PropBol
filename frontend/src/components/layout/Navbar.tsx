'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const togglePanel = () => setIsPanelOpen(!isPanelOpen)

  // Simula el login
  const handleLoginMock = () => {
    setUser({ name: 'Juan Perez', email: 'juan.perez@gmail.com' })
  }

  // Cierra sesión instantáneamente (sin modal de confirmación)
  const handleLogout = () => {
    setUser(null)
    setIsPanelOpen(false)
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PropBol
          </Link>

          <div className="space-x-4">
            <Link href="/" className="hover:text-blue-600 transition">
              Inicio
            </Link>
            <Link href="#contacto" className="hover:text-blue-600 transition">
              Contáctanos
            </Link>
            <Link href="#nosotros" className="hover:text-blue-600 transition">
              Sobre Nosotros
            </Link>
          </div>

          {/* Menú de Usuario */}
          <div className="relative">
            <button onClick={togglePanel} className="bg-gray-200 px-3 py-2 rounded-md font-semibold">
              Usuario
            </button>

            {/* Panel Desplegable */}
            {isPanelOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg p-4 z-50">
                {user ? (
                  <>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                    <Link href="/perfil" className="block text-blue-600 mb-3">
                      Mi perfil
                    </Link>

                    <button onClick={handleLogout} className="w-full bg-red-500 text-white py-1 rounded">
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <button onClick={handleLoginMock} className="w-full bg-blue-600 text-white py-2 rounded">
                    Ingresar / Registrarse
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
