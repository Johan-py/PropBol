'use client'

import { useState } from 'react'
import { Info, Eye, EyeOff } from 'lucide-react'

export default function TwoFactorSection() {
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
    setShowPassword(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Protege tu cuenta con un código de verificación enviado a tu correo electrónico.
        </p>
      </header>

      <div className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200">
                <Info className="h-4 w-4 text-neutral-500" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-neutral-900">¿Cómo funciona?</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Cada vez que inicies sesión, recibirás un código de verificación en tu correo
                  electrónico. Deberás ingresar ese código para completar el inicio de sesión.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Activar
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-neutral-900">
              Ingresa tu contraseña actual para activar la verificación en dos pasos.
            </h3>

            <div className="relative mt-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10 text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              onClick={handleCancel}
              className="mt-4 w-full rounded-lg border py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}