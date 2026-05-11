'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

type ThemeToggleButtonProps = {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggleButton({ className, showLabel = true }: ThemeToggleButtonProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button type="button" aria-label="Cargando tema" className={className} disabled>
        {showLabel && <span className="text-sm">Modo oscuro</span>}
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span className="text-sm">Modo claro</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span className="text-sm">Modo oscuro</span>}
        </>
      )}
    </button>
  )
}