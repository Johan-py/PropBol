import { prisma } from '../../config/prisma.js'

// PUBLICACIÓN
export const findPublicationById = async (publicacionId: number) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId }
  })
}

export const publishPublicationById = async (publicacionId: number) => {
  return prisma.publicacion.update({
    where: { id: publicacionId },
    data: {
      estado: 'ACTIVA',
      fechaPublicacion: new Date()
    }
  })
}

export const countPublishedFreePublicationsByUser = async (usuarioId: number) => {
  return prisma.publicacion.count({
    where: {
      usuarioId,
      estado: 'ACTIVA'
    }
  })
}

// MULTIMEDIA
export const getMultimediaByPublicationId = async (publicacionId: number) => {
  return prisma.multimedia.findMany({
    where: { publicacionId }
  })
}

export const countMultimediaByPublicationIdAndType = async (
  publicacionId: number,
  tipo: 'IMAGEN' | 'VIDEO'
) => {
  return prisma.multimedia.count({
    where: {
      publicacionId,
      tipo
    }
  })
}

export const createMultimediaRepository = async (data: {
  publicacionId: number
  tipo: 'IMAGEN' | 'VIDEO'
  url: string
  pesoMb: number
}) => {
  return prisma.multimedia.create({
    data
  })
}

export const findMultimediaById = async (multimediaId: number) => {
  return prisma.multimedia.findUnique({
    where: { id: multimediaId }
  })
}

export const deleteMultimediaById = async (multimediaId: number) => {
  return prisma.multimedia.delete({
    where: { id: multimediaId }
  })
}