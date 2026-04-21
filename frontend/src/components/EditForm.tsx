import React from 'react'

const OPERATION_TYPES = ['Venta', 'Alquiler', 'Anticrético']

interface FormData {
  title: string
  details: string
  operationType: string
  price: string | number
  location: string
}

interface FieldErrors {
  title?: string
  details?: string
  operationType?: string
  price?: string
  location?: string
}

interface EditFormProps {
  formData: FormData
  fieldErrors: FieldErrors
  onChange: (field: keyof FormData, value: string) => void
  onSave: () => void
  onCancel: () => void
  toast?: string | null
  globalError?: string | null
}

export default function EditForm({
  formData,
  fieldErrors,
  onChange,
  onSave,
  onCancel,
  toast,
  globalError
}: EditFormProps) {
  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Editar Publicación</h1>

      <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 uppercase mb-6">
        Información de la publicación
      </p>

      {toast && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {toast}
        </div>
      )}

      {globalError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Título Propiedad
          </label>
          <input
            type="text"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.title
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            }`}
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Residencia Moderna"
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Detalles de la Propiedad
          </label>
          <input
            type="text"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.details
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            }`}
            value={formData.details}
            onChange={(e) => onChange('details', e.target.value)}
            placeholder="Descripción de la propiedad"
          />
          {fieldErrors.details && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.details}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Tipo Operación
          </label>
          <select
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.operationType
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            }`}
            value={formData.operationType}
            onChange={(e) => onChange('operationType', e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {OPERATION_TYPES.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          {fieldErrors.operationType && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.operationType}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Ubicación
          </label>
          <input
            type="text"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.location
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-gray-100 focus:border-gray-300 focus:ring-2 focus:ring-gray-200'
            }`}
            value={formData.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Cochabamba, Sacaba"
          />
          {fieldErrors.location && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.location}</p>
          )}
        </div>

        <div className="md:col-span-1">
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-gray-600 uppercase mb-2">
            Precio
          </label>
          <input
            type="text"
            className={`w-full rounded-xl border px-4 py-3 text-gray-800 outline-none transition ${
              fieldErrors.price
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200'
            }`}
            value={formData.price}
            onChange={(e) => onChange('price', e.target.value)}
            placeholder="180000"
          />
          {fieldErrors.price && <p className="mt-1 text-sm text-red-500">{fieldErrors.price}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          className="flex-1 rounded-xl bg-[#d8891c] px-6 py-3 text-white font-semibold shadow hover:bg-[#bf7718] transition"
          onClick={onSave}
        >
          GUARDAR CAMBIOS
        </button>

        <button
          className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition"
          onClick={onCancel}
        >
          CANCELAR
        </button>
      </div>
    </div>
  )
}
