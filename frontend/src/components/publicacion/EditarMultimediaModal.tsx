'use client'

import { useEffect, useRef, useState } from 'react'

type EditarMultimediaModalProps = {
  open: boolean
  publicacionId: number
  imagenesActuales: string[]
  videoActual?: string | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el archivo .env.local')
  }

  return apiUrl
}

const getToken = () => {
  if (typeof window === 'undefined') return ''

  return (
    localStorage.getItem('token') ??
    sessionStorage.getItem('token') ??
    localStorage.getItem('jwt') ??
    sessionStorage.getItem('jwt') ??
    ''
  )
}

const convertirArchivoABase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(String(reader.result))
    }

    reader.onerror = () => {
      reject(new Error('No se pudo leer la imagen'))
    }

    reader.readAsDataURL(file)
  })
}

const leerRespuesta = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const texto = await response.text()

  throw new Error(
    texto.includes('<!DOCTYPE')
      ? `La ruta respondió HTML. Verifica que exista el endpoint. Status: ${response.status}`
      : texto || `Error HTTP ${response.status}`
  )
}

export default function EditarMultimediaModal({
  open,
  publicacionId,
  imagenesActuales,
  videoActual,
  onClose,
  onSaved
}: EditarMultimediaModalProps) {
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const [imagenes, setImagenes] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [imagenesNuevas, setImagenesNuevas] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setImagenes(imagenesActuales ?? [])
      setVideoUrl(videoActual ?? '')
      setImagenesNuevas([])
      setError('')
    }
  }, [open, imagenesActuales, videoActual])

  if (!open) return null

  const handleAgregarImagen = () => {
    inputFileRef.current?.click()
  }

  const handleSeleccionarImagen = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/jpg']

    if (!formatosPermitidos.includes(file.type)) {
      setError('Solo se permiten imágenes JPG o PNG')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    if (imagenes.length + imagenesNuevas.length >= 10) {
      setError('Solo puedes tener hasta 10 imágenes')
      return
    }

    try {
      const base64 = await convertirArchivoABase64(file)
      setImagenesNuevas((prev) => [...prev, base64])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la imagen'
      )
    } finally {
      event.target.value = ''
    }
  }

  const handleEliminarImagenActual = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEliminarImagenNueva = (index: number) => {
    setImagenesNuevas((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVistaPrevia = () => {
    if (!videoUrl.trim()) {
      setError('Primero ingresa un enlace de video')
      return
    }

    window.open(videoUrl.trim(), '_blank', 'noopener,noreferrer')
  }

  const handleEliminarVideo = () => {
    setVideoUrl('')
  }

  const handleGuardar = async () => {
    try {
      setGuardando(true)
      setError('')

      const apiUrl = getApiUrl()
      const token = getToken()

      const response = await fetch(
        `${apiUrl}/api/publicaciones/${publicacionId}/multimedia`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            imagenesActuales: imagenes,
            imagenesNuevas,
            videoUrl: videoUrl.trim() || null
          })
        }
      )

      const data = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(
          data?.message ?? data?.error ?? 'No se pudo guardar la multimedia'
        )
      }

      await onSaved()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar la multimedia'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-7 shadow-xl">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">
            Editar imágenes y video
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-3xl leading-none text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Imágenes actuales ({imagenes.length + imagenesNuevas.length}/10)
          </h3>

          <div className="flex flex-wrap gap-4">
            {imagenes.map((imagen, index) => (
              <div
                key={`actual-${imagen}-${index}`}
                className="relative h-36 w-44 overflow-hidden rounded-xl border border-orange-200 bg-gray-100"
              >
                <img
                  src={imagen}
                  alt={`Imagen actual ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleEliminarImagenActual(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  ×
                </button>
              </div>
            ))}

            {imagenesNuevas.map((imagen, index) => (
              <div
                key={`nueva-${index}`}
                className="relative h-36 w-44 overflow-hidden rounded-xl border border-orange-200 bg-gray-100"
              >
                <img
                  src={imagen}
                  alt={`Imagen nueva ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleEliminarImagenNueva(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  ×
                </button>
              </div>
            ))}

            {imagenes.length + imagenesNuevas.length < 10 && (
              <button
                type="button"
                onClick={handleAgregarImagen}
                className="flex h-36 w-44 flex-col items-center justify-center rounded-xl border border-dashed border-gray-400 bg-white text-gray-700 hover:bg-gray-50"
              >
                <span className="text-3xl font-bold">+</span>
                <span className="mt-3 text-lg">Agregar imagen</span>
              </button>
            )}
          </div>

          <input
            ref={inputFileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleSeleccionarImagen}
            className="hidden"
          />

          <p className="mt-4 text-sm text-gray-500">
            Puedes subir hasta 10 imágenes. Formatos: JPG, PNG. Tamaño máximo:
            5MB por imagen.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Video de la propiedad opcional
          </h3>

          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-14 flex-1 rounded-lg border border-gray-300 px-4 text-lg outline-none focus:border-[#D97706]"
            />

            <button
              type="button"
              onClick={handleVistaPrevia}
              className="h-14 rounded-lg border border-[#D97706] px-7 font-semibold text-[#D97706] hover:bg-orange-50"
            >
              Vista previa
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setError('El video se actualizará al guardar multimedia')}
              className="h-12 rounded-lg border border-[#D97706] font-semibold text-[#D97706] hover:bg-orange-50"
            >
              Cambiar video
            </button>

            <button
              type="button"
              onClick={handleEliminarVideo}
              className="h-12 rounded-lg border border-red-400 font-semibold text-red-500 hover:bg-red-50"
            >
              Eliminar video
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Puedes agregar un enlace de YouTube o Vimeo.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="h-14 rounded-lg border border-gray-400 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="h-14 rounded-lg bg-[#D97706] font-semibold text-white hover:bg-[#bf6905] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {guardando ? 'Guardando...' : 'Guardar multimedia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}