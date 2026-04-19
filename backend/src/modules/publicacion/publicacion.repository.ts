import { prisma } from '../../lib/prisma.client.js'

const ESTADO_PUBLICACION_ELIMINADA = 'ELIMINADA' as const
const ESTADO_INMUEBLE_INACTIVO = 'INACTIVO' as const

export const buscarPublicacionesPorUsuarioRepository = async (usuarioId: number) => {
  return prisma.publicacion.findMany({
    where: {
      usuarioId,
      estado: {
        not: ESTADO_PUBLICACION_ELIMINADA
      }
    },
    include: {
      multimedia: true,
      inmueble: {
        include: {
          ubicacion: {
            select: {
              id: true,
              direccion: true,
              latitud: true,
              longitud: true,
              inmuebleId: true,
              ubicacionMaestraId: true
            }
          }
        }
      }
    },
    orderBy: {
      fechaPublicacion: 'desc'
    }
  })
}

export const buscarPublicacionPorIdRepository = async (id: number) => {
  return prisma.publicacion.findUnique({
    where: { id },
    include: {
      inmueble: {
        include: {
          ubicacion: true
        }
      },
      multimedia: true
    }
  })
}

export const actualizarPublicacionRepository = async (publicacionId: number, data: any) => {
  const titulo = data.titulo ?? data.title
  const descripcion = data.descripcion ?? data.details
  const tipoAccion = data.tipoAccion ?? data.operationType
  const direccion = data.ubicacion ?? data.location

  const precioRaw = data.precio ?? data.price
  const precio =
    precioRaw !== undefined && precioRaw !== null && precioRaw !== ''
      ? Number(precioRaw)
      : undefined

  const dataToUpdate: any = {}
  const inmuebleData: any = {}

  if (titulo !== undefined) dataToUpdate.titulo = titulo
  if (descripcion !== undefined) dataToUpdate.descripcion = descripcion
  if (tipoAccion !== undefined) inmuebleData.tipoAccion = tipoAccion
  if (precio !== undefined && !Number.isNaN(precio)) inmuebleData.precio = precio
  if (direccion !== undefined) {
    inmuebleData.ubicacion = {
      update: {
        direccion
      }
    }
  }

  if (Object.keys(inmuebleData).length > 0) {
    dataToUpdate.inmueble = {
      update: inmuebleData
    }
  }

  return prisma.publicacion.update({
    where: { id: publicacionId },
    data: dataToUpdate,
    include: {
      multimedia: true,
      inmueble: {
        include: {
          ubicacion: true
        }
      }
    }
  })
}

export const eliminarLogicamentePublicacionRepository = async (
  publicacionId: number,
  inmuebleId: number
) => {
  return prisma.$transaction([
    prisma.publicacion.update({
      where: { id: publicacionId },
      data: {
        estado: ESTADO_PUBLICACION_ELIMINADA
      }
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: ESTADO_INMUEBLE_INACTIVO
      }
    })
  ])
}