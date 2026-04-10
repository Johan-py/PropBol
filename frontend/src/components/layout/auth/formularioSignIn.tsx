'use client'

<<<<<<< HEAD
import { useState } from 'react'
=======
import { useRef, useState } from 'react'
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type LoginResponse = {
  message?: string
  token?: string
  user?: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
<<<<<<< HEAD
=======
    avatar?: string | null
  }
}

type MeResponse = {
  message?: string
  user?: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
    avatar?: string | null
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
  }
}

type GooglePopupSuccessMessage = {
  type: 'propbol:google-login-success'
  message: string
  token: string
  user: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
  }
}

type GooglePopupErrorMessage = {
  type: 'propbol:google-login-error'
  code: 'GOOGLE_AUTH_FAILED' | 'ACCOUNT_NOT_REGISTERED' | string
  message: string
}

type GooglePopupMessage = GooglePopupSuccessMessage | GooglePopupErrorMessage

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const LOGIN_TIMEOUT_MS = 10000
const GOOGLE_LOGIN_TIMEOUT_MS = 2 * 60 * 1000
<<<<<<< HEAD
=======
const DEFAULT_POST_LOGIN_REDIRECT = '/'
const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin'
const SESSION_DURATION_MS = 3 * 60 * 1000
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

const NO_CONNECTION_MESSAGE = 'Sin conexión a internet. Verifica tu red e intenta nuevamente.'
const SERVER_CONNECTION_MESSAGE = 'No se pudo conectar con el servidor. Intenta nuevamente.'
const LOGIN_TIMEOUT_MESSAGE = 'La solicitud tardó demasiado. Por favor intenta nuevamente.'
const GOOGLE_TIMEOUT_MESSAGE =
  'La autenticación con Google tardó demasiado. Por favor intenta nuevamente.'

<<<<<<< HEAD
const saveSession = (token: string, user?: LoginResponse['user']) => {
  localStorage.setItem('token', token)

  const userName =
    user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : (user?.correo ?? 'Usuario')
=======
const clearClientSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('propbol_user')
  localStorage.removeItem('propbol_session_expires')
  localStorage.removeItem('nombre')
  localStorage.removeItem('correo')
  localStorage.removeItem('avatar')

  window.dispatchEvent(new Event('propbol:session-changed'))
  window.dispatchEvent(new Event('auth-state-changed'))
}

const saveSession = (
  token: string,
  user?: {
    id: number
    correo: string
    nombre?: string
    apellido?: string
    avatar?: string | null
  }
) => {
  localStorage.setItem('token', token)

  const userName =
    user?.nombre && user?.apellido
      ? `${user.nombre} ${user.apellido}`
      : user?.nombre || user?.correo || 'Usuario'
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

  localStorage.setItem(
    'propbol_user',
    JSON.stringify({
      name: userName,
<<<<<<< HEAD
      email: user?.correo ?? ''
    })
  )

  localStorage.setItem('propbol_session_expires', String(Date.now() + 60 * 60 * 1000))

  window.dispatchEvent(new Event('propbol:login'))
  window.dispatchEvent(new Event('propbol:session-changed'))
=======
      email: user?.correo ?? '',
      avatar: user?.avatar ?? null
    })
  )

  localStorage.setItem('nombre', userName)
  localStorage.setItem('correo', user?.correo ?? '')
  localStorage.setItem('avatar', user?.avatar ?? '')
  localStorage.setItem('propbol_session_expires', String(Date.now() + SESSION_DURATION_MS))

  window.dispatchEvent(new Event('propbol:login'))
  window.dispatchEvent(new Event('propbol:session-changed'))
  window.dispatchEvent(new Event('auth-state-changed'))
}

const getRedirectAfterLogin = () => {
  const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)

  if (!redirect || !redirect.startsWith('/')) {
    return DEFAULT_POST_LOGIN_REDIRECT
  }

  return redirect
}

const clearRedirectAfterLogin = () => {
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
}

const isGooglePopupMessage = (value: unknown): value is GooglePopupMessage => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'type' in value
}

const hasNoInternetConnection = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  return !navigator.onLine
}

const getRequestErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.name === 'AbortError') {
    return LOGIN_TIMEOUT_MESSAGE
  }

  if (hasNoInternetConnection()) {
    return NO_CONNECTION_MESSAGE
  }

  return SERVER_CONNECTION_MESSAGE
}
<<<<<<< HEAD
=======

const fetchCurrentUser = async (token: string): Promise<NonNullable<MeResponse['user']>> => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = (await response.json()) as MeResponse

  if (!response.ok || !data.user) {
    throw new Error(data.message || 'No se pudo validar la sesión')
  }

  return data.user
}
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
<<<<<<< HEAD
=======
  const passwordContainerRef = useRef<HTMLDivElement>(null)
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

<<<<<<< HEAD
=======
  const redirectAfterSuccessfulLogin = () => {
    const redirect = getRedirectAfterLogin()
    clearRedirectAfterLogin()
    router.push(redirect)
  }

>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
  const isFormValid = correo.length > 0 && password.length > 0 && !errors.correo && !errors.password

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors }

    if (field === 'correo') {
      if (!value) {
        newErrors.correo = 'El correo es obligatorio'
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.correo = 'Formato de correo inválido'
      } else {
        delete newErrors.correo
      }
    }

    if (field === 'password') {
      if (!value) {
        newErrors.password = 'La contraseña es obligatoria'
      } else if (value.length > 16) {
        newErrors.password = 'La contraseña no puede tener más de 16 caracteres'
      } else {
        delete newErrors.password
      }
    }

    setErrors(newErrors)
  }
<<<<<<< HEAD

  const handleGoogleLogin = () => {
=======

  const finalizeValidatedSession = async (token: string, fallbackUser?: LoginResponse['user']) => {
    const validatedUser = await fetchCurrentUser(token)

    if (!validatedUser) {
      throw new Error('No se pudo obtener el usuario autenticado.')
    }

    saveSession(token, {
      id: validatedUser.id,
      correo: validatedUser.correo,
      nombre: validatedUser.nombre ?? fallbackUser?.nombre,
      apellido: validatedUser.apellido ?? fallbackUser?.apellido,
      avatar: validatedUser.avatar ?? fallbackUser?.avatar ?? null
    })
  }

  const handleGoogleLogin = () => {
    clearClientSession()
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
    setGoogleError('')
    setErrorMessage('')
    setSuccessMessage('')

    if (hasNoInternetConnection()) {
      setGoogleError(NO_CONNECTION_MESSAGE)
      return
    }

    setIsLoadingGoogle(true)

    const popupWidth = 500
    const popupHeight = 600
    const left = window.screenX + (window.outerWidth - popupWidth) / 2
    const top = window.screenY + (window.outerHeight - popupHeight) / 2

    const popupWindow = window.open(
      `${API_URL}/api/auth/google/login`,
      'google-login',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
    )

    if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
      setGoogleError(
        'El navegador bloqueó la ventana emergente. Habilita los pop-ups para continuar.'
      )
      setIsLoadingGoogle(false)
      return
    }

    const popup = popupWindow
    popup.focus()

    const expectedOrigin = new URL(API_URL).origin
    let authWasResolved = false
    let checkPopupIntervalId = 0
    let googleTimeoutId = 0

    function cleanup(shouldStopLoading = true) {
      window.removeEventListener('message', handleMessage)
      window.clearInterval(checkPopupIntervalId)
      window.clearTimeout(googleTimeoutId)

      if (shouldStopLoading) {
        setIsLoadingGoogle(false)
      }
    }

    async function handleMessage(event: MessageEvent<GooglePopupMessage>) {
      if (event.origin !== expectedOrigin) {
        return
      }

      if (!isGooglePopupMessage(event.data)) {
        return
      }

      authWasResolved = true
      cleanup(false)

      if (event.data.type === 'propbol:google-login-success') {
<<<<<<< HEAD
        saveSession(event.data.token, event.data.user)
        setSuccessMessage(event.data.message || 'Inicio de sesión con Google exitoso')
        setIsLoadingGoogle(false)
        popup.close()

        window.setTimeout(() => {
          router.push('/')
        }, 1000)

        return
      }

=======
        try {
          await finalizeValidatedSession(event.data.token, event.data.user)

          setSuccessMessage(event.data.message || 'Inicio de sesión con Google exitoso')
          setGoogleError('')
          setIsLoadingGoogle(false)
          popup.close()

          window.setTimeout(() => {
            redirectAfterSuccessfulLogin()
          }, 1000)
        } catch (error) {
          clearClientSession()
          setGoogleError(
            error instanceof Error ? error.message : 'No se pudo consolidar la sesión con Google.'
          )
          setIsLoadingGoogle(false)
          popup.close()
        }

        return
      }

      clearClientSession()
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
      setGoogleError(event.data.message || 'No se pudo iniciar sesión con Google.')
      setIsLoadingGoogle(false)
      popup.close()
    }

    checkPopupIntervalId = window.setInterval(() => {
      if (!popup.closed) {
        return
      }

      cleanup()

      if (!authWasResolved) {
        clearClientSession()

        if (hasNoInternetConnection()) {
          setGoogleError(NO_CONNECTION_MESSAGE)
          return
        }

<<<<<<< HEAD
        const tokenGuardado = localStorage.getItem('token')

        if (!tokenGuardado) {
          setGoogleError('Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.')
        }
=======
        setGoogleError('Cancelaste el inicio de sesión con Google. Puedes intentarlo nuevamente.')
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
      }
    }, 500)

    googleTimeoutId = window.setTimeout(() => {
      cleanup()
<<<<<<< HEAD
=======
      clearClientSession()
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

      if (!popup.closed) {
        popup.close()
      }

      setGoogleError(hasNoInternetConnection() ? NO_CONNECTION_MESSAGE : GOOGLE_TIMEOUT_MESSAGE)
    }, GOOGLE_LOGIN_TIMEOUT_MS)

    window.addEventListener('message', handleMessage)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedCorreo = correo.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const newErrors: { correo?: string; password?: string } = {}

    if (!trimmedCorreo) {
      newErrors.correo = 'El correo es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(trimmedCorreo)) {
      newErrors.correo = 'Formato de correo inválido'
    }

    if (!trimmedPassword) {
      newErrors.password = 'La contraseña es obligatoria'
    }

    setErrors(newErrors)
    setErrorMessage('')
    setSuccessMessage('')
    setGoogleError('')

    if (Object.keys(newErrors).length > 0) {
      return
    }

    if (hasNoInternetConnection()) {
      setPassword('')
      setErrorMessage(NO_CONNECTION_MESSAGE)
      return
    }

    setIsLoading(true)
<<<<<<< HEAD
=======
    clearClientSession()
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      controller.abort()
    }, LOGIN_TIMEOUT_MS)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: trimmedCorreo,
          password: trimmedPassword
        }),
        signal: controller.signal
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setPassword('')

        if (response.status === 404) {
          setErrorMessage(
            'Esta cuenta no está registrada. Puedes registrarte para crear una cuenta.'
          )
          return
        }

        setErrorMessage(data.message || 'Error al iniciar sesión')
        return
      }

<<<<<<< HEAD
      if (data.token) {
        saveSession(data.token, data.user)
      }

      setSuccessMessage(data.message || 'Inicio de sesión exitoso')

      window.setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
=======
      if (!data.token) {
        clearClientSession()
        setErrorMessage('El servidor no devolvió un token válido')
        return
      }

      await finalizeValidatedSession(data.token, data.user)

      setSuccessMessage(data.message || 'Inicio de sesión exitoso')

      window.setTimeout(() => {
        redirectAfterSuccessfulLogin()
      }, 1000)
    } catch (error) {
      clearClientSession()
>>>>>>> d035455e2b35f2177fdcfa0b99607734c0e9413e
      setPassword('')
      setErrorMessage(getRequestErrorMessage(error))
    } finally {
      window.clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Iniciar Sesión</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Correo electrónico</label>

          <input
            type="email"
            required
            autoFocus
            placeholder="Ingresa tu correo electrónico"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              validate('correo', e.target.value)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />

          {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>

          <div
            className="relative"
            ref={passwordContainerRef}
            onBlur={(e) => {
              if (!passwordContainerRef.current?.contains(e.relatedTarget as Node)) {
                setShowPassword(false)
              }
            }}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Ingresa tu contraseña"
              value={password}
              maxLength={16}
              onChange={(e) => {
                setPassword(e.target.value)
                validate('password', e.target.value)
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {errorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
            !isFormValid || isLoading
              ? 'cursor-not-allowed bg-orange-300'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="text-base font-bold">G</span>
          {isLoadingGoogle ? 'Autenticando...' : 'Continuar con Google'}
        </button>

        {googleError && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {googleError}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push('/')}
          className="mx-auto block w-fit rounded-md bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Cancelar Inicio de sesión
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link href="/sign-up" className="font-semibold text-orange-500 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
