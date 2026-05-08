'use client'

import React from 'react'
//Componente para colocar las opciones de compartir del blog, pendiente de implementar xd

export default function BlogSharePlaceholder() {
  return (
    <div className="mt-8 w-full rounded-2xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 min-h-[120px] transition-all duration-300">
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-[#a56400]">
          Compartir
        </h3>
        <div className="flex items-center justify-center">
          <span className="text-stone-300 font-medium text-sm">Contenido de compartir próximamente</span>
        </div>
      </div>
    </div>
  )
}
