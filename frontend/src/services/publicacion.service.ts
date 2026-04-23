<<<<<<< HEAD
import type { MisPublicacionesItem } from '@/types/publicacion'
=======
import type {
  EditarPublicacionPayload,
  MisPublicacionesItem,
  PublicacionDetalle
} from '@/types/publicacion'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('Falta NEXT_PUBLIC_API_URL en el entorno')
  }

  return apiUrl
}

function getToken() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No hay sesión activa. Inicia sesión nuevamente.')
  }

  return token
}

export async function obtenerMisPublicaciones(): Promise<MisPublicacionesItem[]> {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/mias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las publicaciones')
  }

  return data.data
<<<<<<< HEAD
=======
}

export async function obtenerDetallePublicacion(id: number): Promise<PublicacionDetalle> {
  const apiUrl = getApiUrl()

  const response = await fetch(`${apiUrl}/api/publicaciones/${id}/detalle`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el detalle de la publicación')
  }

  return data.data
}

export async function editarPublicacion(id: number, payload: EditarPublicacionPayload) {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la publicación')
  }

  return data.data
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
}

export async function eliminarPublicacion(id: number) {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar la publicación')
  }

  return data
<<<<<<< HEAD
}
=======
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
