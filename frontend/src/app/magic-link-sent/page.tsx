'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MagicLinkSentPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [resent, setResent] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
    const pendingEmail = sessionStorage.getItem('magicLinkEmail')
    if (!pendingEmail) {
        router.replace('/sign-in')
        return
    }
    setEmail(pendingEmail)
    }, [router])

    useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
    }, [cooldown])

    const handleResend = async () => {
    if (cooldown > 0 || !email) return
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

    try {
        await fetch(`${API_URL}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email }),
        })
        setResent(true)
        setCooldown(60)
        setTimeout(() => setResent(false), 4000)
    } catch {
    }
    }

  const handleBack = () => {
    sessionStorage.removeItem('magicLinkEmail')
    router.replace('/sign-in')
    }

    const domain = email ? email.split('@')[1] : ''

    return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4 py-10">
        <div className="w-full max-w-sm">

        <div className="rounded-xl border border-[#e7e5e4] bg-white px-6 py-8 shadow-sm sm:px-8">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                />
            </svg>
            </div>

            <h1 className="text-center text-2xl font-bold text-[#292524] sm:text-3xl">
            Revisa tu correo
            </h1>

            <p className="mt-3 text-center text-sm leading-relaxed text-[#78716c]">
            Te enviamos un enlace de acceso a{' '}
            <span className="break-all font-semibold text-[#292524]">{email}</span>.
            <br />
            El enlace expira en <span className="font-semibold text-amber-600">15 minutos</span>.
            </p>

            <div className="my-6 border-t border-[#f0ede9]" />

            <ol className="space-y-3 text-sm text-[#57534e]">
            <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                1
                </span>
                Abre tu aplicación de correo
            </li>
            <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                2
                </span>
                Busca un correo de <span className="font-medium text-[#292524]">PropBol</span>
            </li>
            <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                3
                </span>
                Haz clic en el botón <span className="font-medium text-[#292524]">"Ingresar a PropBol"</span>
            </li>
            </ol>

            <div className="my-6 border-t border-[#f0ede9]" />

            {domain && (
            <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 active:scale-95"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
                </svg>
                Abrir {domain}
            </a>
            )}

            <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full rounded-md border border-[#d6d3d1] px-4 py-2.5 text-sm font-medium text-[#57534e] transition hover:bg-[#f5f5f4] disabled:cursor-not-allowed disabled:text-[#a8a29e]"
            >
            {resent
                ? '✓ Enlace reenviado'
                : cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : 'Reenviar enlace'}
            </button>

            <button
            type="button"
            onClick={handleBack}
            className="mt-3 w-full text-center text-sm text-[#a8a29e] underline-offset-2 hover:text-[#78716c] hover:underline"
            >
            Volver al inicio de sesión
            </button>
        </div>

        {/* Nota de spam */}
        <p className="mt-4 text-center text-xs text-[#a8a29e]">
            ¿No encuentras el correo? Revisa tu carpeta de spam o correo no deseado.
        </p>

        </div>
    </div>
    )
}