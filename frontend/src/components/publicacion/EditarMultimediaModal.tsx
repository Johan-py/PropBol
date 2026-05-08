'use client'

import type { PublicacionImagen } from '@/types/publicacion'

type EditarMultimediaModalProps = {
  open: boolean
  imagenesActuales: PublicacionImagen[]
  videoActual?: string | null
  onClose: () => void
}

export default function EditarMultimediaModal({
  open,
  imagenesActuales,
  videoActual,
  onClose
}: EditarMultimediaModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">
            Editar imágenes y video
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Imágenes actuales ({imagenesActuales.length}/10)
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {imagenesActuales.map((imagen) => (
            <div
              key={imagen.id}
              className="relative h-28 overflow-hidden rounded-xl border border-gray-200"
            >
              <img
                src={imagen.url}
                alt="Imagen de publicación"
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-gray-400 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="text-2xl font-bold">+</span>
            Agregar imagen
          </button>
        </div>

        <p className="mb-6 text-xs text-gray-500">
          Puedes subir hasta 10 imágenes. Formatos: JPG, PNG. Tamaño máximo:
          5MB por imagen.
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Video de la propiedad opcional
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              defaultValue={videoActual ?? ''}
              placeholder="Pega un enlace de YouTube o Vimeo"
              className="h-11 flex-1 rounded-lg border border-gray-300 px-4 outline-none focus:border-[#D97706]"
            />

            <button
              type="button"
              className="h-11 rounded-lg border border-[#D97706] px-4 text-sm font-semibold text-[#D97706] hover:bg-orange-50"
            >
              Vista previa
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Puedes agregar un enlace de YouTube o Vimeo.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-lg border border-gray-400 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            className="h-11 flex-1 rounded-lg bg-[#D97706] text-sm font-medium text-white hover:bg-[#bf6905]"
          >
            Guardar multimedia
          </button>
        </div>
      </div>
    </div>
  )
}