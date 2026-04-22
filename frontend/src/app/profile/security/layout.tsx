'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SecuritySidebar from '@/components/security/SecuritySidebar'

type SecurityLayoutProps = {
  children: ReactNode
}

export default function SecurityLayout({ children }: SecurityLayoutProps) {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (!token) {
      router.replace('/sign-in')
      return
    }

    setIsVerified(true)
  }, [router])

  // No renderiza nada hasta verificar — evita flash del contenido protegido
  if (!isVerified) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <SecuritySidebar />

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          {children}
        </section>
      </div>
    </div>
  )
}
