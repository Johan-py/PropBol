import { LocationsRepository } from './locations.repository.js'
import { prisma } from '../../lib/prisma.client.js'

export class LocationsService {
  private repository = new LocationsRepository()

  async searchLocations(query: string) {
    if (!query || query.length < 2) return []

    // 1. Ejecutamos las 4 búsquedas en paralelo (Optimización de rendimiento)
    const [deptos, provincias, municipios, zonas] = await Promise.all([
      (prisma as any).departamento.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { provincias: { take: 4 } },
        take: 1
      }),
      (prisma as any).provincia.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { departamento: true, municipios: { take: 4 } },
        take: 1
      }),
      (prisma as any).municipio.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { provincia: true, zonas: { take: 4 } },
        take: 1
      }),
      (prisma as any).zona.findMany({
        where: { nombre: { contains: query, mode: 'insensitive' } },
        include: { municipio: true, barrios: { take: 4 } },
        take: 2
      })
    ])

    const sugerencias: any[] = []

    // 2. Procesamos en orden de prioridad para búsquedas inmobiliarias
    municipios.forEach((m: any) => {
      sugerencias.push({
        id: m.id,
        nivel: 'MUNICIPIO',
        nombre: m.nombre,
        contexto: `Municipio en ${m.provincia.nombre}`
      })
      m.zonas.forEach((z: any) => {
        sugerencias.push({
          id: z.id,
          nivel: 'ZONA',
          nombre: z.nombre,
          contexto: `Zona de ${m.nombre}`
        })
      })
    })

    zonas.forEach((z: any) => {
      if (!sugerencias.find((s: any) => s.nivel === 'ZONA' && s.id === z.id)) {
        sugerencias.push({
          id: z.id,
          nivel: 'ZONA',
          nombre: z.nombre,
          contexto: `Zona en ${z.municipio.nombre}`
        })
        z.barrios.forEach((b: any) => {
          sugerencias.push({
            id: b.id,
            nivel: 'BARRIO',
            nombre: b.nombre,
            contexto: `Barrio en ${z.nombre}`
          })
        })
      }
    })

    deptos.forEach((d: any) => {
      sugerencias.push({
        id: d.id,
        nivel: 'DEPARTAMENTO',
        nombre: d.nombre,
        contexto: 'Departamento de Bolivia'
      })
      d.provincias.forEach((p: any) => {
        sugerencias.push({
          id: p.id,
          nivel: 'PROVINCIA',
          nombre: p.nombre,
          contexto: `Provincia en ${d.nombre}`
        })
      })
    })

    // Retornamos estrictamente un máximo de 5 resultados
    return sugerencias.slice(0, 5)
  }

  async incrementPopularity(id: number) {
    if (!id) throw new Error('ID de ubicación no proporcionado')
    return await this.repository.incrementPopularity(id)
  }
}
