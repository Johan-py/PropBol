import {
  getPublicationMultimediaService,
  registerVideoLinkService
} from './multimedia.service.js'

export const getPublicationMultimediaController = async ({
  id_publicacion,
  usuario_id
}: {
  id_publicacion: number
  usuario_id: number
}) => {
  return getPublicationMultimediaService({ id_publicacion, usuario_id })
}

export const registerVideoLinkController = async ({
  id_publicacion,
  usuario_id,
  videoUrl
}: {
  id_publicacion: number
  usuario_id: number
  videoUrl: string
}) => {
  return registerVideoLinkService({ id_publicacion, usuario_id, videoUrl })
}