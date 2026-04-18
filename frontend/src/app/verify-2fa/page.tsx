'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Verify2FAPage() {
    const router = useRouter()
    const [codigo, setCodigo] = useState('')

    const handleBack = () => {
    sessionStorage.removeItem('2fa_correo')
    router.replace('/sign-in')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4">
        <div className="w-full max-w-sm rounded-md border border-[#e7e5e4] bg-white p-6 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-[#292524]">
            Verificacion en dos pasos
        </h1>

        <p className="mt-3 text-center text-sm text-[#57534e]">
            Te enviamos un código a tu correo para confirmar que eres tú
        </p>

        <div className="mt-6 space-y-4">
            <div>
            <label className="mb-1 block text-sm font-medium text-[#292524]">
                Código de verificación
            </label>
            <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ingresa el código"
                className="w-full rounded-md border border-[#e7e5e4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            </div>

            <button
            type="button"
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
            Verificar código
            </button>

            <button
            type="button"
            onClick={handleBack}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
            Volver al inicio de sesión
            </button>
        </div>
        </div>
    </div>
    )
}