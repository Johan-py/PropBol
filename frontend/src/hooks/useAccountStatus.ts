'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const TOKEN_KEY = 'token'
const POLL_INTERVAL_MS = 15 * 1000

const clearClientSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('propbol_user')
  localStorage.removeItem('propbol_session_expires')
  localStorage.removeItem('nombre')
  localStorage.removeItem('correo')
  localStorage.removeItem('avatar')

  window.dispatchEvent(new Event('propbol:session-changed'))
  window.dispatchEvent(new Event('auth-state-changed'))
}

export function useAccountStatus() {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkAccountStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) return

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // 403 = cuenta desactivada
      // 401 = sesión expirada o inválida
      if (response.status === 403 || response.status === 401) {
        clearClientSession()
        router.replace('/')
        return
      }
    } catch {}
  }, [router])

  useEffect(() => {
    // Verificación inmediata al montar
    void checkAccountStatus()

    // Polling cada 15 segundos
    intervalRef.current = setInterval(() => {
      void checkAccountStatus()
    }, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkAccountStatus])
}
