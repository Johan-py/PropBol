import type {
  EditarPublicacionPayload,
  MisPublicacionesItem,
  PublicacionDetalle
} from '@/types/publicacion'

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

  const publicaciones = Array.isArray(data.data) ? data.data : []
  return publicaciones.map((pub: any) => ({
    ...pub,
    totalVisualizaciones: Number(pub.totalVisualizaciones ?? 0),
    totalCompartidos: Number(pub.totalCompartidos ?? 0)
  }))
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
}
<<<<<<< HEAD
export async function iniciarPublicidad(publicacionId: number): Promise<{ checkoutUrl: string }> {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${publicacionId}/publicitar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
=======

export async function editarMultimediaPublicacion(
  id: number,
  formData: FormData
) {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${id}/multimedia`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
>>>>>>> c6a97b8f2833225a78a0841470b09eae6a8ba279
  })

  const data = await response.json()

  if (!response.ok) {
<<<<<<< HEAD
    throw new Error(data.message || 'Error al iniciar publicidad')
  }

  return data
}


export async function cancelarPublicidad(publicacionId: number): Promise<{ ok: boolean; message: string }> {
  const apiUrl = getApiUrl()
  const token = getToken()

  const response = await fetch(`${apiUrl}/api/publicaciones/${publicacionId}/publicitar/cancelar`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error al cancelar publicidad')
  }

  return data
=======
    throw new Error(data.message || 'No se pudo actualizar la multimedia')
  }

  return data.data
>>>>>>> c6a97b8f2833225a78a0841470b09eae6a8ba279
}