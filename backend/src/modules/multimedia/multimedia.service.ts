import {
  createMultimediaRepository,
  findPublicationById,
  getMultimediaByPublicationId,
  countMultimediaByPublicationIdAndType,
  countPublishedFreePublicationsByUser,
  publishPublicationById,
  findMultimediaById,
  deleteMultimediaById
} from './multimedia.repository.js'

export const MULTIMEDIA_TYPES = {
  IMAGE: 1,
  VIDEO: 2
} as const

const MAX_IMAGES_PER_PUBLICATION = 5
const MAX_VIDEOS_PER_PUBLICATION = 2
const MAX_FREE_PUBLICATIONS = Number(process.env.MAX_FREE_PUBLICATIONS ?? 3)

const isYouTubeUrl = (url: string) => {
  try {
    const u = new URL(url)
    return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')
  } catch {
    return false
  }
}

export const getPublicationMultimediaService = async ({
  id_publicacion,
  usuario_id
}: {
  id_publicacion: number
  usuario_id: number
}) => {
  const publication = await findPublicationById(id_publicacion)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const multimedia = await getMultimediaByPublicationId(id_publicacion)

  return { publication, multimedia }
}

export const registerVideoLinkService = async ({
  id_publicacion,
  usuario_id,
  videoUrl
}: {
  id_publicacion: number
  usuario_id: number
  videoUrl: string
}) => {
  const publication = await findPublicationById(id_publicacion)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  if (!isYouTubeUrl(videoUrl)) {
    throw new Error('Enlace de video no válido')
  }

  const totalVideos = await countMultimediaByPublicationIdAndType(id_publicacion, MULTIMEDIA_TYPES.VIDEO)
  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    id_publicacion,
    id_tipo: MULTIMEDIA_TYPES.VIDEO,
    url: videoUrl,
    formato: 'youtube',
    peso_mb: 0
  })

  return { publication, multimedia: newVideo }
}

// ✅ TAREA 4: registrar video subido (archivo)
export const registerVideoFileService = async ({
  id_publicacion,
  usuario_id,
  url,
  formato,
  peso_mb
}: {
  id_publicacion: number
  usuario_id: number
  url: string
  formato: string
  peso_mb: number
}) => {
  const publication = await findPublicationById(id_publicacion)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const totalVideos = await countMultimediaByPublicationIdAndType(id_publicacion, MULTIMEDIA_TYPES.VIDEO)
  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    id_publicacion,
    id_tipo: MULTIMEDIA_TYPES.VIDEO,
    url,
    formato,
    peso_mb
  })

  return { publication, multimedia: newVideo }
}

// ✅ TAREA 5: eliminar multimedia
export const deleteMultimediaService = async ({
  id_multimedia,
  usuario_id
}: {
  id_multimedia: number
  usuario_id: number
}) => {
  const media = await findMultimediaById(id_multimedia)
  if (!media) throw new Error('Multimedia no encontrado')

  const publication = await findPublicationById(media.id_publicacion)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const deleted = await deleteMultimediaById(id_multimedia)
  if (!deleted) throw new Error('No se pudo eliminar')

  return { publication, multimedia: deleted }
}

// ✅ TAREA 6: publicar inmueble
export const publishPublicationService = async ({
  id_publicacion,
  usuario_id,
  confirmacion_publicacion
}: {
  id_publicacion: number
  usuario_id: number
  confirmacion_publicacion: boolean
}) => {
  const publication = await findPublicationById(id_publicacion)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  if (!confirmacion_publicacion) {
    throw new Error('Debes marcar el checkbox de confirmación para publicar')
  }

  if (publication.es_gratis) {
    const totalGratis = await countPublishedFreePublicationsByUser(usuario_id)
    if (totalGratis >= MAX_FREE_PUBLICATIONS) {
      throw new Error('LIMITE_GRATUITO_ALCANZADO')
    }
  }

  const updated = await publishPublicationById(id_publicacion)
  if (!updated) throw new Error('No se pudo publicar')

  return { publication: updated }
}