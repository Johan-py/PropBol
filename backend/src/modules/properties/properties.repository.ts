import { PrismaClient, Categoria, TipoAccion } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL no está definido en el entorno')

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

export const propertiesRepository = {
  async getAll(filtros: any = {}) {
    // ── WHERE ──────────────────────────────────────────────────────────────
    const where: any = { estado: 'ACTIVO' }

    if (filtros.tipoInmueble) {
      const entrada = Array.isArray(filtros.tipoInmueble) ? filtros.tipoInmueble : [filtros.tipoInmueble];
      const validas = entrada
        .map((c: string) => c.toUpperCase())
        .filter((c: string) => ['CASA', 'DEPARTAMENTO', 'TERRENO', 'OFICINA'].includes(c));
      if (validas.length > 0) where.categoria = { in: validas };
    }

    if (filtros.modoInmueble) {
      const entrada = Array.isArray(filtros.modoInmueble) ? filtros.modoInmueble : [filtros.modoInmueble];
      const validas = entrada
        .map((m: string) => m.toUpperCase().includes('ANTICR') ? 'ANTICRETO' : m.toUpperCase())
        .filter((m: string) => ['VENTA', 'ALQUILER', 'ANTICRETO'].includes(m));
      if (validas.length > 0) where.tipoAccion = { in: validas };
    }

    if (filtros.query && filtros.query.trim() !== '') {
      const searchText = filtros.query.trim();
      where.OR = [
        { titulo: { contains: searchText, mode: 'insensitive' } },
        {
          ubicacion: {
            OR: [
              { direccion: { contains: searchText, mode: 'insensitive' } },
              { zona: { contains: searchText, mode: 'insensitive' } },
              { ciudad: { contains: searchText, mode: 'insensitive' } },
              {
                ubicacion_maestra: {
                  nombre: { contains: searchText, mode: 'insensitive' }
                }
              }
            ]
          }
        }
      ];
    }
    // ── ORDER BY ───────────────────────────────────────────────────────────
    // mas-populares: ordena por ubicacion → ubicacion_maestra → popularidad desc
    // Prisma soporta orderBy anidado siguiendo las relaciones del schema.
    // Los inmuebles sin ubicacion o sin ubicacion_maestra quedan al final
    // porque Prisma coloca nulls last por defecto en desc.
    //
    // Para precio y superficie: el frontend los maneja con criterioActivo,
    // así que el backend solo necesita proveer el default y popularidad.
    let orderBy: any[] = [];

    if (filtros.precio === 'menor-a-mayor') {
      orderBy.push({ precio: 'asc' });
    } else if (filtros.precio === 'mayor-a-menor') {
      orderBy.push({ precio: 'desc' });
    } else if (filtros.superficie === 'menor-a-mayor') {
      orderBy.push({ superficieM2: 'asc' });
    } else if (filtros.superficie === 'mayor-a-menor') {
      orderBy.push({ superficieM2: 'desc' });
    } else if (filtros.fecha === 'mas-populares') {
      orderBy.push({ ubicacion: { ubicacion_maestra: { popularidad: 'desc' } } });
    } else if (filtros.fecha === 'mas-antiguos') {
      orderBy.push({ fechaPublicacion: 'asc' });
    }

    orderBy.push({ fechaPublicacion: 'desc' }); // Desempate default

    return prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
            ubicacion_maestra: true // Vital para mostrar zonas de Cochabamba [cite: 1335-1339]
          }
        },
        publicaciones: {
          where: { estado: 'ACTIVA' },
          include: { multimedia: true } // Para obtener las fotos reales
        }
      }
    });
  }
}