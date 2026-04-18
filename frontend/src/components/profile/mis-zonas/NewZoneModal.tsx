'use client'

import { useState } from 'react'

interface NewZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: { name: string; reference: string }) => void
}

export default function NewZoneModal({ isOpen, onClose, onSave }: NewZoneModalProps) {
  const [name, setName] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !reference.trim()) {
      setError('Completa el nombre y la referencia de la zona.')
      return
    }

    onSave({
      name: name.trim(),
      reference: reference.trim()
    })

    setName('')
    setReference('')
    setError('')
  }

  const handleClose = () => {
    setName('')
    setReference('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nueva zona</h2>
          <p className="mt-1 text-sm text-gray-500">Registra una nueva zona guardada.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="zone-name" className="mb-1 block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="zone-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Zona Oeste"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="zone-reference"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Referencia
            </label>
            <input
              id="zone-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej. Cochabamba, Bolivia"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Guardar zona
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
