import { prisma } from '../../lib/prisma.client.js'
import type { TutorialPublicacionEstadoRecord } from './tutorial-publicacion.types.js'

const mapTutorialEstadoRecord = (record: {
  id: number
  usuarioId: number
  confirmado: boolean
  confirmadoEn: Date | null
}): TutorialPublicacionEstadoRecord => ({
  id: record.id,
  usuarioId: record.usuarioId,
  confirmado: record.confirmado,
  confirmadoEn: record.confirmadoEn
})

export const findTutorialEstadoByUsuarioIdRepository = async (
  usuarioId: number
): Promise<TutorialPublicacionEstadoRecord | null> => {
  const record = await prisma.tutorialPublicacionUsuario.findUnique({
    where: { usuarioId },
    select: {
      id: true,
      usuarioId: true,
      confirmado: true,
      confirmadoEn: true
    }
  })

  return record ? mapTutorialEstadoRecord(record) : null
}

export const upsertTutorialConfirmadoRepository = async (
  usuarioId: number
): Promise<TutorialPublicacionEstadoRecord> => {
  const now = new Date()

  const record = await prisma.tutorialPublicacionUsuario.upsert({
    where: { usuarioId },
    create: {
      usuarioId,
      confirmado: true,
      confirmadoEn: now
    },
    update: {
      confirmado: true
    },
    select: {
      id: true,
      usuarioId: true,
      confirmado: true,
      confirmadoEn: true
    }
  })

  return mapTutorialEstadoRecord(record)
}