import { prisma } from '../../lib/prisma.client.js'
import { Prisma } from '@prisma/client'

const crearPoi = async (inmuebleId: number, nombre: string, latitud: number, longitud: number) => {
  return prisma.puntoInteres.create({
    data: {
      inmuebleId,
      nombre,
      latitud: new Prisma.Decimal(latitud),
      longitud: new Prisma.Decimal(longitud)
    }
  })
}

const eliminarPoi = async (poiId: number, usuarioId: number) => {
  const poi = await prisma.puntoInteres.findUnique({
    where: { id: poiId },
    include: { inmueble: { select: { propietarioId: true } } }
  })

  if (!poi) throw new Error('POI_NOT_FOUND')
  if (poi.inmueble.propietarioId !== usuarioId) throw new Error('FORBIDDEN')

  return prisma.puntoInteres.delete({ where: { id: poiId } })
}

const listarPoisPorInmueble = async (inmuebleId: number) => {
  return prisma.puntoInteres.findMany({
    where: { inmuebleId },
    orderBy: { id: 'asc' },
    select: { id: true, nombre: true, latitud: true, longitud: true }
  })
}

export default { crearPoi, eliminarPoi, listarPoisPorInmueble }
