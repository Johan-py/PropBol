export type MultimediaRecord = {
  id_multimedia: number
  id_publicacion: number
  id_tipo: number
  url: string
  formato: string
  peso_mb: number
}

type PublicacionRecord = {
  id_publicacion: number
  usuario_id: number
  titulo: string
}

const publicacionesMock: PublicacionRecord[] = [
  { id_publicacion: 1, usuario_id: 1, titulo: 'Casa en venta' },
  { id_publicacion: 2, usuario_id: 2, titulo: 'Departamento céntrico' }
]

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
  return publicacionesMock.find(
    (publicacion) => publicacion.id_publicacion === id_publicacion
  )
}

export const getMultimediaByPublicationId = async (id_publicacion: number) => {
  return multimediaTable.filter(
    (multimedia) => multimedia.id_publicacion === id_publicacion
  )
}

export const countMultimediaByPublicationIdAndType = async (
  id_publicacion: number,
  id_tipo: number
) => {
  return multimediaTable.filter(
    (multimedia) =>
      multimedia.id_publicacion === id_publicacion &&
      multimedia.id_tipo === id_tipo
  ).length
}

export const createMultimediaRepository = async (
  data: Omit<MultimediaRecord, 'id_multimedia'>
) => {
  const newRecord: MultimediaRecord = {
    id_multimedia: multimediaTable.length + 1,
    ...data
  }

  multimediaTable.push(newRecord)

  return newRecord
}