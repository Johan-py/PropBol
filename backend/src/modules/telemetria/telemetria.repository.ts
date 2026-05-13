import { prisma } from '../../lib/prisma.client.js'

export class TelemetriaRepository {
  async guardarBusqueda(usuarioId: number | null, ip: string, metaData: any) {
    const treintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000)

    const visitorExistente = await prisma.visitor.findFirst({
      where: {
        ip: ip,
        fecha_visita: { gte: treintaMinutosAtras }
      }
    })

    if (visitorExistente) {
      const metaDataExistente = (visitorExistente.meta_data as any) || {}
      const busquedasAnteriores = metaDataExistente.busquedas || []

      return await prisma.visitor.update({
        where: { id: visitorExistente.id },
        data: {
          meta_data: {
            ...metaDataExistente,
            busquedas: [...busquedasAnteriores, metaData],
            ultimaBusqueda: new Date().toISOString()
          }
        }
      })
    } else {
      return await prisma.visitor.create({
        data: {
          ip: ip,
          usuario_id: usuarioId,
          meta_data: {
            busquedas: [metaData],
            primeraVisita: new Date().toISOString()
          }
        }
      })
    }
  }

  async registrarClickInmueble(usuarioId: number, inmuebleId: number) {
    return await prisma.propiedad_vista.upsert({
      where: {
        usuarioId_inmuebleId: {
          usuarioId: usuarioId,
          inmuebleId: inmuebleId
        }
      },
      update: {
        vistaEn: new Date()
      },
      create: {
        usuarioId: usuarioId,
        inmuebleId: inmuebleId,
        vistaEn: new Date()
      }
    })
  }

  async obtenerInmueblesRecomendados(usuarioId?: number): Promise<number[]> {
    if (!usuarioId) {
      // CA 1: Si no está registrado, devolver populares generales
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmuebleId'],
        _count: {
          inmuebleId: true,
        },
        orderBy: {
          _count: {
            inmuebleId: 'desc',
          },
        },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmuebleId);
    }

    // CA 5, CA 6, CA 7, CA 10: Si está registrado, buscar por su historial
    const vistas = await prisma.propiedad_vista.findMany({
      where: { usuarioId: usuarioId },
      orderBy: { vistaEn: 'desc' },
      take: 20,
      select: { inmuebleId: true }
    })

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId: usuarioId },
      select: { inmuebleId: true }
    })

    const idsFavoritos = favoritos.map((f) => f.inmuebleId)
    const idsVistos = vistas.map((v) => v.inmuebleId)

    const resultados = [...new Set([...idsFavoritos, ...idsVistos])];

    // Fallback: Si el usuario está registrado pero su historial está vacío (ej. cuenta recién creada)
    if (resultados.length === 0) {
      const popularesGlobales = await prisma.propiedad_vista.groupBy({
        by: ['inmuebleId'],
        _count: { inmuebleId: true },
        orderBy: { _count: { inmuebleId: 'desc' } },
        take: 20,
      });
      return popularesGlobales.map((p) => p.inmuebleId);
    }

    return resultados;
  }
}
