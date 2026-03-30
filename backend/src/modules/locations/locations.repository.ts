import prisma from '../../lib/prisma.js' // Ruta relativa correcta

export class LocationsRepository {
  async findByName(query: string) {
    return await prisma.ubicacion_maestra.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { municipio: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        municipio: true,
        departamento: true,
      },
      orderBy: { popularidad: 'desc' },
      take: 5,
    });
  }

  async incrementPopularity(id: number) {
    return await prisma.ubicacion_maestra.update({
      where: { id: id },
      data: {
        popularidad: {
          increment: 1
        }
      }
    });
  }
}