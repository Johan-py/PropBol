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
  IMAGE: 'IMAGEN',
  VIDEO: 'VIDEO'
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
  publicacionId,
  usuarioId
}: {
  publicacionId: number
  usuarioId: number
}) => {
  const publication = await findPublicationById(publicacionId)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const multimedia = await getMultimediaByPublicationId(publicacionId)

  return { publication, multimedia }
}

export const registerVideoLinkService = async ({
  publicacionId,
  usuarioId,
  videoUrl
}: {
  publicacionId: number
  usuarioId: number
  videoUrl: string
}) => {
  const publication = await findPublicationById(publicacionId)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  if (!isYouTubeUrl(videoUrl)) {
    throw new Error('Enlace de video no válido')
  }

  const totalVideos = await countMultimediaByPublicationIdAndType(
    publicacionId,
    MULTIMEDIA_TYPES.VIDEO
  )

  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    publicacionId,
    tipo: MULTIMEDIA_TYPES.VIDEO,
    url: videoUrl,
    pesoMb: 0
  })

  return { publication, multimedia: newVideo }
}

export const registerVideoFileService = async ({
  publicacionId,
  usuarioId,
  url,
  pesoMb
}: {
  publicacionId: number
  usuarioId: number
  url: string
  pesoMb: number
}) => {
  const publication = await findPublicationById(publicacionId)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const totalVideos = await countMultimediaByPublicationIdAndType(
    publicacionId,
    MULTIMEDIA_TYPES.VIDEO
  )

  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    publicacionId,
    tipo: MULTIMEDIA_TYPES.VIDEO,
    url,
    pesoMb
  })

  return { publication, multimedia: newVideo }
}

export const deleteMultimediaService = async ({
  multimediaId,
  usuarioId
}: {
  multimediaId: number
  usuarioId: number
}) => {
  const media = await findMultimediaById(multimediaId)
  if (!media) throw new Error('Multimedia no encontrado')

  const publication = await findPublicationById(media.publicacionId)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const deleted = await deleteMultimediaById(multimediaId)
  if (!deleted) throw new Error('No se pudo eliminar')

  return { publication, multimedia: deleted }
}

export const publishPublicationService = async ({
  publicacionId,
  usuarioId,
  confirmacionPublicacion
}: {
  publicacionId: number
  usuarioId: number
  confirmacionPublicacion: boolean
}) => {
  const publication = await findPublicationById(publicacionId)
  if (!publication) throw new Error('La publicación no existe')

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  if (!confirmacionPublicacion) {
    throw new Error('Debes marcar el checkbox de confirmación para publicar')
  }

  const totalGratis = await countPublishedFreePublicationsByUser(usuarioId)
  if (totalGratis >= MAX_FREE_PUBLICATIONS) {
    throw new Error('LIMITE_GRATUITO_ALCANZADO')
  }

  const updated = await publishPublicationById(publicacionId)
  if (!updated) throw new Error('No se pudo publicar')

  return { publication: updated }
}