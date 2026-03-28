export type MultimediaRecord = {
  id_multimedia: number
  id_publicacion: number
  id_tipo: number // 1=IMAGEN, 2=VIDEO (link o archivo)
  url: string
  formato: string
  peso_mb: number
}

type PublicacionEstado = 'BORRADOR' | 'PUBLICADA'

type PublicacionRecord = {
  id_publicacion: number
  usuario_id: number
  titulo: string
  estado: PublicacionEstado
  es_gratis: boolean
}

// MOCK temporal (por ahora). Luego se reemplaza por DB real.
const publicacionesMock: PublicacionRecord[] = [
  { id_publicacion: 1, usuario_id: 1, titulo: 'Casa en venta', estado: 'BORRADOR', es_gratis: true },
  { id_publicacion: 2, usuario_id: 2, titulo: 'Departamento céntrico', estado: 'BORRADOR', es_gratis: true }
]

// MOCK temporal (por ahora)
const multimediaTable: MultimediaRecord[] = [
  {
    id_multimedia: 1,
    id_publicacion: 1,
    id_tipo: 1,
    url: 'https://example.com/portada.jpg',
    formato: 'jpg',
    peso_mb: 2.4
  }
]

export const findPublicationById = async (id_publicacion: number) => {
  return publicacionesMock.find((p) => p.id_publicacion === id_publicacion)
}

export const publishPublicationById = async (id_publicacion: number) => {
  const pub = publicacionesMock.find((p) => p.id_publicacion === id_publicacion)
  if (!pub) return null
  pub.estado = 'PUBLICADA'
  return pub
}

export const countPublishedFreePublicationsByUser = async (usuario_id: number) => {
  return publicacionesMock.filter((p) => p.usuario_id === usuario_id && p.es_gratis && p.estado === 'PUBLICADA')
    .length
}

export const getMultimediaByPublicationId = async (id_publicacion: number) => {
  return multimediaTable.filter((m) => m.id_publicacion === id_publicacion)
}

export const countMultimediaByPublicationIdAndType = async (id_publicacion: number, id_tipo: number) => {
  return multimediaTable.filter((m) => m.id_publicacion === id_publicacion && m.id_tipo === id_tipo).length
}

export const createMultimediaRepository = async (data: Omit<MultimediaRecord, 'id_multimedia'>) => {
  const newRecord: MultimediaRecord = { id_multimedia: multimediaTable.length + 1, ...data }
  multimediaTable.push(newRecord)
  return newRecord
}

export const findMultimediaById = async (id_multimedia: number) => {
  return multimediaTable.find((m) => m.id_multimedia === id_multimedia)
}

export const deleteMultimediaById = async (id_multimedia: number) => {
  const idx = multimediaTable.findIndex((m) => m.id_multimedia === id_multimedia)
  if (idx === -1) return null
  const deleted = multimediaTable.splice(idx, 1)[0]
  return deleted
}