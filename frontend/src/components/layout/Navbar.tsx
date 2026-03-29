'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type User = {
  name: string
  email: string
}

const USER_STORAGE_KEY = 'propbol_user'
const SESSION_EXPIRES_KEY = 'propbol_session_expires'
const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hora

export default function Navbar() {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const clearSession = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(SESSION_EXPIRES_KEY)
    setUser(null)
    setIsPanelOpen(false)
    setShowLogoutModal(false)
  }

  const isSessionExpired = () => {
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY)
    if (!expiresAt) return true
    return Date.now() > Number(expiresAt)
  }

  const restoreSession = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY)

    if (!savedUser || !expiresAt) {
      clearSession()
      return
    }

    if (Date.now() > Number(expiresAt)) {
      clearSession()
      return
    }

    setUser(JSON.parse(savedUser))
  }

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return

      if (!panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        clearSession()
        router.push('/')
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [user, router])

  const togglePanel = () => {
    if (user && isSessionExpired()) {
      clearSession()
      router.push('/')
      return
    }

    setIsPanelOpen(!isPanelOpen)
  }

  const handleLoginMock = () => {
    const mockUser: User = {
      name: 'Juan Perez',
      email: 'juan.perez@gmail.com',
    }

    const expiresAt = Date.now() + SESSION_DURATION_MS

    setUser(mockUser)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser))
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt))
  }

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    if (isLoggingOut) return
    setShowLogoutModal(false)
  }

  const handleConfirmLogout = () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    setTimeout(() => {
      clearSession()
      setIsLoggingOut(false)
      router.push('/')
    }, 400)
  }

  return (
    <>
      {/* Fondo color hueso sólido */}
      <nav className="sticky top-0 z-40 bg-[#F9F6EE] border-b border-gray-200 shadow-sm w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            {/* CONTENEDOR IZQUIERDO: Agrupa el Logo y el Menú de Navegación */}
            <div className="flex items-center gap-10">
              {/* Logo original a la izquierda */}
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-black hover:opacity-80 transition p-1"
              >
                <div className="w-8 h-8 bg-black rounded-sm"></div>
                Prop<span className="text-[#E68B25]">Bol</span>
              </Link>

              {/* Menú de Navegación junto al logo */}
              <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700">
                <Link href="/" className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition">
                  Inicio
                </Link>
                <Link href="#contacto" className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition">
                  Contáctanos
                </Link>
                <Link href="#nosotros" className="hover:text-[#E68B25] hover:bg-[#E68B25]/10 px-3 py-2 rounded-md transition">
                  Sobre Nosotros
                </Link>
              </div>
            </div>

            {/* CONTENEDOR DERECHO: Solo Icono de Usuario y Panel */}
            <div className="relative" ref={panelRef}>
                <button
                  onClick={togglePanel}
                  className="p-2 text-gray-700 rounded-full hover:bg-black/5 hover:shadow-sm transition duration-200 focus:outline-none"
                  aria-label="Menú de usuario"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </button>

                {/* Modal/Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-72 rounded-xl border border-gray-200 bg-[#F9F6EE] shadow-lg p-5 z-50 transition-all duration-200 ${
                    isPanelOpen
                      ? 'opacity-100 translate-y-0 visible'
                      : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
                    <span className="font-bold text-sm text-gray-900">Bienvenido a PropBol</span>
                    <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 hover:text-black hover:bg-black/5 rounded px-2 py-1 transition">✕</button>
                  </div>

                  {user ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <Link
                        href="/perfil"
                        className="flex justify-between w-full text-black font-bold mb-4 hover:bg-black/5 p-2 rounded transition text-sm"
                        onClick={() => setIsPanelOpen(false)}
                      >
                        Mi perfil <span>&gt;</span>
                      </Link>

                      {/* Botón de Cerrar Sesión */}
                      <button
                        onClick={handleOpenLogoutModal}
                        className="w-full bg-[#E68B25] text-white py-2 rounded-lg font-bold shadow-sm hover:bg-[#cf7b1f] transition text-sm"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#E68B25]/10 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#E68B25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-5 px-2">Encuentra tu hogar ideal hoy mismo.</p>
                      
                      {/* Botón de Ingreso con el nuevo color */}
                      <button
                        onClick={handleLoginMock}
                        className="w-full bg-[#E68B25] text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#cf7b1f] transition-all active:scale-95"
                      >
                        Ingresar / Registrarse
                      </button>
                    </div>
                  )}
                </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
          showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className={`bg-[#F9F6EE] w-[360px] rounded-xl shadow-xl px-6 py-6 text-center transition-all duration-200 ${
            showLogoutModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
          }`}
        >
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">
            ¿Cerrar Sesión?
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Se finalizará tu sesión actual en este dispositivo.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            {/* Botón Salir en color rojo */}
            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="flex-1 py-2 rounded-lg bg-[#ff0050] text-white font-semibold shadow-sm hover:bg-[#e60048] transition disabled:opacity-50"
            >
              {isLoggingOut ? 'Cerrando...' : 'Salir'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}