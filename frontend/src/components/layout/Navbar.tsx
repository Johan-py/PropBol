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
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-black hover:text-gray-700 transition p-1 rounded"
            >
              <div className="w-8 h-8 bg-black rounded-sm"></div>
              PropBol
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-black hover:shadow-sm transition p-1 rounded">
                Inicio
              </Link>
              <Link href="#contacto" className="hover:text-black hover:shadow-sm transition p-1 rounded">
                Contáctanos
              </Link>
              <Link href="#nosotros" className="hover:text-black hover:shadow-sm transition p-1 rounded">
                Sobre Nosotros
              </Link>
            </div>

            <div className="relative" ref={panelRef}>
              <button
                onClick={togglePanel}
                className="p-2 text-gray-700 rounded-full hover:bg-gray-100 hover:shadow-sm transition duration-200 focus:outline-none"
                aria-label="Menú de usuario"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl border bg-white shadow-xl p-5 z-50 transition-all duration-200 ${
                  isPanelOpen
                    ? 'opacity-100 translate-y-0 visible'
                    : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }`}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <span className="font-bold text-sm text-gray-900">Bienvenido a PropBol</span>
                  <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 hover:text-black hover:shadow-sm rounded transition px-1">✕</button>
                </div>

                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-500 rounded-full"></div> 
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/perfil"
                      className="flex justify-between w-full text-black font-bold mb-4 hover:shadow-sm p-1 rounded transition text-sm"
                      onClick={() => setIsPanelOpen(false)}
                    >
                      Mi perfil <span>&gt;</span>
                    </Link>

                    <button
                      onClick={handleOpenLogoutModal}
                      className="w-full bg-[#ff0050] text-white py-2 rounded-lg font-bold shadow-md hover:opacity-90 hover:shadow-lg transition text-sm"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <button
                      onClick={handleLoginMock}
                      className="text-sm font-semibold text-gray-600 hover:text-black hover:shadow-sm p-2 rounded transition w-full"
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

      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
          showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className={`bg-white w-[360px] rounded-2xl shadow-xl px-6 py-5 text-center transition-all duration-200 ${
            showLogoutModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
          }`}
        >
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">
            ¿Cerrar Sesión?
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Se finalizará tu sesión actual en este dispositivo.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="px-5 py-2 rounded-lg bg-[#ff0050] text-white font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}