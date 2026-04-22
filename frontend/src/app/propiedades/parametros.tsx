'use client'

import { useState } from 'react'
import ExtrasPropiedad from '@/components/extras-propiedad/ExtrasPropiedad'

export default function Page() {
  const [parametrosGuardados, setParametrosGuardados] = useState<string[]>([])

  const manejarGuardarParametros = (parametros: string[]) => {
    setParametrosGuardados(parametros)
    console.log('Parámetros guardados:', parametros)
  }

  return (
    <main className="min-h-screen bg-[#f5efe7] p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Prueba de parámetros personalizados
        </h1>

        <p className="mb-6 text-gray-600">
          Esta pantalla es temporal para probar la funcionalidad antes de unirla con multimedia.
        </p>

        <ExtrasPropiedad
          valoresIniciales={parametrosGuardados}
          onGuardar={manejarGuardarParametros}
        />

        {parametrosGuardados.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Parámetros guardados</h2>

            <div className="flex flex-wrap gap-2">
              {parametrosGuardados.map((parametro, index) => (
                <span
                  key={`${parametro}-${index}`}
                  className="rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-700"
                >
                  {parametro}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
