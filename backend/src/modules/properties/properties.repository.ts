import { PrismaClient, Categoria, TipoAccion } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL no está definido en el entorno')

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

type OrdenFecha = 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

interface FiltrosBusqueda {
  categoria?: string | string[]
  tipoAccion?: string
  fecha?: OrdenFecha
  precio?: OrdenDireccion
  superficie?: OrdenDireccion
}

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
          where.OR = [
            { titulo: { contains: filtros.query, mode: 'insensitive' } },
            {
              ubicacion: {
                OR: [
                  { direccion: { contains: filtros.query, mode: 'insensitive' } },
                  {
                    // Buscamos en el nombre de la ubicación maestra (Cochabamba, Cala Cala, etc.)
                    ubicacion_maestra: {
                      nombre: { contains: filtros.query, mode: 'insensitive' }
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

    // 1. Orden por Precio (Menor o Mayor)
    if (filtros.precio === 'menor-a-mayor') {
      orderBy.push({ precio: 'asc' });
    } else if (filtros.precio === 'mayor-a-menor') {
      orderBy.push({ precio: 'desc' });
    } 
    // 2. Orden por Superficie
    else if (filtros.superficie === 'menor-a-mayor') {
      orderBy.push({ superficieM2: 'asc' });
    } else if (filtros.superficie === 'mayor-a-menor') {
      orderBy.push({ superficieM2: 'desc' });
    }
    // 3. Orden por Popularidad
    else if (filtros.fecha === 'mas-populares') {
      orderBy.push({ ubicacion: { ubicacion_maestra: { popularidad: 'desc' } } });
    } 
    // 4. Orden Cronológico
    else if (filtros.fecha === 'mas-antiguos') {
      orderBy.push({ fechaPublicacion: 'asc' });
    }

    // Siempre un desempate por defecto (más recientes)
    orderBy.push({ fechaPublicacion: 'desc' });
      }
    }