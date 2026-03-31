const API_URL = 'http://localhost:5000/api'

export const api = {
  getPublicaciones: async (usuarioId: number) => {
    const res = await fetch(`${API_URL}/publicaciones/usuario/${usuarioId}`)
    return res.json()
  },

  updatePublicacion: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deletePublicacion: async (id: number) => {
    const res = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'DELETE'
    })
    return res.json()
  }
}