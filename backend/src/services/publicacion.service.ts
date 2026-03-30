import { prisma } from '../prismaClient.js'

const createProperty = async (data: any, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const inmueble = await tx.inmueble.create({
      data: {
        titulo: data.titulo,
        tipoAccion: data.tipoAccion,
        categoria: data.categoria,
        precio: data.precio,
        superficieM2: data.superficieM2,
        nroCuartos: data.nroCuartos,
        nroBanos: data.nroBanos,
        descripcion: data.descripcion,
        propietarioId: userId,
        ubicacion: {
          create: {
            direccion: data.direccion,
            zona: data.zona,
            ciudad: data.ciudad || 'Cochabamba',
            latitud: data.latitud || 0,
            longitud: data.longitud || 0
          }
        }
      },
      include: {
        ubicacion: true
      }
    })

    const publicacion = await tx.publicacion.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        usuarioId: userId,
        inmuebleId: inmueble.id
      }
    })

    return { inmueble, publicacion }
  })

  return result
}

export default { createProperty }
