'use client'

import React from 'react'

export default function BlogSharePlaceholder() {
  return (
    <div className="mt-8 w-full rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 min-h-[120px] transition-all duration-300">
      <div className="flex items-center justify-center h-full">
        {/* Este espacio será utilizado para las funcionalidades de compartir */}
        <span className="text-stone-300 font-medium text-sm">Contenido de compartir próximamente</span>
      </div>
    </div>
  )
}
