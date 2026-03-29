import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const propertiesRepository = {

  async search(filtros: any) {

    const whereClause: any = {}

    if (filtros.categoria) {

      const categorias = Array.isArray(filtros.categoria)
        ? filtros.categoria
        : [filtros.categoria]

      whereClause.categoria = {
        in: categorias
      }

    }

    if (filtros.tipoAccion) {

      whereClause.tipoAccion = filtros.tipoAccion

    }

    whereClause.estado = "ACTIVO"

    const properties = await prisma.inmueble.findMany({

      where: whereClause,

      include: {
        ubicacion: true
      },

      orderBy: {
        fechaPublicacion: "desc"
      }

    })

    return properties

  }

}