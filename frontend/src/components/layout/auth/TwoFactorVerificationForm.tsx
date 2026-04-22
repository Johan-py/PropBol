'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TwoFactorVerificationForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleCodeChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '').slice(0, 6)
    setCode(onlyNumbers)
    setError('')
  }

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.trim().replace(/\D/g, '').slice(0, 6)

    setCode(cleaned)
    setError('')
  }

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos')
      return
    }

    setError('')
    
  }

  const handleBackToLogin = () => {
    router.push('/sign-in')
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
      <h1 className="text-2xl font-bold text-gray-900">
        Verificación en dos pasos
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Ingresa el código de 6 dígitos enviado a tu correo electrónico.
      </p>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Código de verificación
        </label>

        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onPaste={handleCodePaste}
          placeholder="123456"
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 focus:border-orange-500'
          }`}
        />

        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al login
        </button>

        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={code.length !== 6}
          className="flex-1 rounded-md bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          Verificar código
        </button>
      </div>
    </div>
  )
}