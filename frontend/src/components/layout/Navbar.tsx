<<<<<<< HEAD
'use client'

import Link from 'next/link'
import { useNotifications } from '@/hooks/useNotifications'

export default function Navbar() {
  const {
    open,
    filter,
    notifications,
    filteredNotifications,
    visibleNotifications,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    archiveNotification,
    loadMoreNotifications,
    isLoggedIn,
    setIsLoggedIn
  } = useNotifications()

  const unreadCount = notifications.filter((n) => n.status === 'no leida').length
=======
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
>>>>>>> main

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-4">
<<<<<<< HEAD
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PropBol
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-blue-600">
              Inicio
            </Link>

            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-full p-2 transition hover:bg-gray-100"
                aria-label="Abrir notificaciones"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
                  </div>
                  {!isLoggedIn ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">
                        Inicia sesión para recibir notificaciones
                      </p>
                      <div className="mt-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setIsLoggedIn(true)}
                          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          Iniciar sesión
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setFilter('todas')}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            filter === 'todas'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Todas
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilter('leida')}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            filter === 'leida'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Leídas
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilter('no leida')}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            filter === 'no leida'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No leídas
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilter('archivada')}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            filter === 'archivada'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Archivadas
                        </button>
                      </div>

                      <div
                        className="max-h-80 overflow-y-auto"
                        onScroll={(e) => {
                          const target = e.currentTarget
                          const reachedBottom =
                            target.scrollTop + target.clientHeight >= target.scrollHeight - 10
                          if (reachedBottom) {
                            loadMoreNotifications()
                          }
                        }}
                      >
                        {filteredNotifications.length === 0 ? (
                          <p className="px-4 py-6 text-center text-sm text-gray-500">
                            No hay notificaciones
                          </p>
                        ) : (
                          <>
                            {visibleNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => {
                                  if (notification.status !== 'archivada') {
                                    markAsRead(notification.id)
                                  }
                                }}
                                className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                                  notification.status === 'no leida' ? 'bg-blue-50' : 'bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {notification.title?.trim() || '(Sin título)'}
                                  </p>
                                  <span className="text-[10px] uppercase text-gray-400">
                                    {notification.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {notification.description?.trim() ||
                                    '(Sin descripción disponible)'}
                                </p>
                                {notification.status !== 'archivada' && (
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        archiveNotification(notification.id)
                                      }}
                                      className="text-xs text-gray-400 transition hover:text-gray-600"
                                    >
                                      Archivar
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {visibleNotifications.length < filteredNotifications.length && (
                              <p className="px-4 py-3 text-center text-xs text-gray-400">
                                Cargando más notificaciones...
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-100 px-4 py-3 text-center">
                        <Link
                          href="/notificaciones"
                          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                        >
                          Ver todo
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
=======
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
>>>>>>> main
          </div>

        </div>
      </div>
    </nav>
  )
} 