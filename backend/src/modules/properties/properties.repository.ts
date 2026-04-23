<<<<<<< HEAD
import { prisma } from "../../lib/prisma.client.js";
=======
import { prisma } from '../../lib/prisma.client.js'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

export interface FiltrosBusqueda {
  categoria?: string | string[]
  tipoInmueble?: string | string[]
  modoInmueble?: string | string[]
  query?: string
  locationId?: number
  fecha?: 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
  precio?: 'menor-a-mayor' | 'mayor-a-menor'
  superficie?: 'menor-a-mayor' | 'mayor-a-menor'
  minPrice?: number | null
  maxPrice?: number | null
  currency?: string | null
}

// Helper para limpiar las variaciones de Anticrético
function normalizarModoAccion(m: string): string {
  const v = m.toUpperCase().trim()
  return v.includes('ANTICR') ? 'ANTICRETO' : v
}

// Helper para limpiar las variaciones de Anticrético
function normalizarModoAccion(m: string): string {
  const v = m.toUpperCase().trim();
  return v.includes("ANTICR") ? "ANTICRETO" : v;
}

export const propertiesRepository = {
  async getAll(filtros: FiltrosBusqueda = {}) {
    // ── WHERE ──────────────────────────────────────────────────────────────
    const where: any = { estado: 'ACTIVO' }

    // 1. Filtro de Categoría / Tipo Inmueble (Soporta múltiples selecciones)
<<<<<<< HEAD
    const CATEGORIAS_VALIDAS = ["CASA", "DEPARTAMENTO", "TERRENO", "OFICINA"];
    const rawTipo = filtros.tipoInmueble || filtros.categoria;
    if (rawTipo) {
      const rawArr = (Array.isArray(rawTipo) ? rawTipo : [rawTipo])
        .map((t) => String(t).toUpperCase().trim())
        .filter((t) => t && t !== "CUALQUIER TIPO");

      const tipos = rawArr.filter((t) => CATEGORIAS_VALIDAS.includes(t));

      if (rawArr.length > 0 && tipos.length === 0) {
        return [];
      } else if (tipos.length === 1) {
        where.categoria = tipos[0];
      } else if (tipos.length > 1) {
        where.categoria = { in: tipos };
=======
    const CATEGORIAS_VALIDAS = ['CASA', 'DEPARTAMENTO', 'TERRENO', 'OFICINA']
    const rawTipo = filtros.tipoInmueble || filtros.categoria
    if (rawTipo) {
      const rawArr = (Array.isArray(rawTipo) ? rawTipo : [rawTipo])
        .map((t) => String(t).toUpperCase().trim())
        .filter((t) => t && t !== 'CUALQUIER TIPO')

      const tipos = rawArr.filter((t) => CATEGORIAS_VALIDAS.includes(t))

      if (rawArr.length > 0 && tipos.length === 0) {
        return []
      } else if (tipos.length === 1) {
        where.categoria = tipos[0]
      } else if (tipos.length > 1) {
        where.categoria = { in: tipos }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
      }
    }

    // 2. Filtro de Modo Inmueble (Soporta Venta, Alquiler, Anticrético simultáneos)
    if (filtros.modoInmueble) {
      const modosRaw = Array.isArray(filtros.modoInmueble)
        ? filtros.modoInmueble
<<<<<<< HEAD
        : [filtros.modoInmueble];

      const modos = modosRaw
        .filter((m) => m && String(m).trim() !== "")
        .map((m) => normalizarModoAccion(String(m)));

      if (modos.length === 1) {
        where.tipoAccion = modos[0];
      } else if (modos.length > 1) {
        where.tipoAccion = { in: modos };
=======
        : [filtros.modoInmueble]

      const modos = modosRaw
        .filter((m) => m && String(m).trim() !== '')
        .map((m) => normalizarModoAccion(String(m)))

      if (modos.length === 1) {
        where.tipoAccion = modos[0]
      } else if (modos.length > 1) {
        where.tipoAccion = { in: modos }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
      }
    }

    // 3. Filtro de Ubicación (EL CEREBRO JERÁRQUICO)
    if (filtros.query && filtros.query.trim() !== '') {
      const texto = filtros.query.trim()

      where.OR = [
        { titulo: { contains: texto, mode: 'insensitive' } },
        { descripcion: { contains: texto, mode: 'insensitive' } },
        {
          ubicacion: {
            OR: [
              // Nivel Micro
              { direccion: { contains: texto, mode: 'insensitive' } },
              // Jerarquía Nueva Completa
              { barrio: { nombre: { contains: texto, mode: 'insensitive' } } },
              { barrio: { zona: { nombre: { contains: texto, mode: 'insensitive' } } } },
<<<<<<< HEAD
              { barrio: { zona: { municipio: { nombre: { contains: texto, mode: 'insensitive' } } } } },
              { barrio: { zona: { municipio: { provincia: { nombre: { contains: texto, mode: 'insensitive' } } } } } },
              { barrio: { zona: { municipio: { provincia: { departamento: { nombre: { contains: texto, mode: 'insensitive' } } } } } } },
=======
              {
                barrio: {
                  zona: { municipio: { nombre: { contains: texto, mode: 'insensitive' } } }
                }
              },
              {
                barrio: {
                  zona: {
                    municipio: { provincia: { nombre: { contains: texto, mode: 'insensitive' } } }
                  }
                }
              },
              {
                barrio: {
                  zona: {
                    municipio: {
                      provincia: {
                        departamento: { nombre: { contains: texto, mode: 'insensitive' } }
                      }
                    }
                  }
                }
              },
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
              // Tabla Maestra Legacy (Por compatibilidad con datos viejos)
              { ubicacion_maestra: { nombre: { contains: texto, mode: 'insensitive' } } },
              { ubicacion_maestra: { municipio: { contains: texto, mode: 'insensitive' } } },
              { ubicacion_maestra: { departamento: { contains: texto, mode: 'insensitive' } } }
            ]
          }
        }
      ]
    } else if (filtros.locationId) {
      // Fallback: Si no hay texto, asumimos que viene de un botón antiguo de "Ciudades Destacadas"
      where.ubicacion = { ubicacionMaestraId: Number(filtros.locationId) }
<<<<<<< HEAD
=======
    }
    // ── FILTRO DE PRECIO con conversión de moneda ─────────────────
    const TASA_CAMBIO_BOB = 6.96 // 1 USD = 6.96 BOB

    let queryMinPrice = filtros.minPrice
    let queryMaxPrice = filtros.maxPrice

    // Si el usuario busca en BOB, convertimos a USD antes de consultar la BD
    if (filtros.currency) {
      const monedaUpper = filtros.currency.toUpperCase()
      if (monedaUpper === 'BOB' || monedaUpper === 'BS') {
        if (queryMinPrice != null) queryMinPrice = queryMinPrice / TASA_CAMBIO_BOB
        if (queryMaxPrice != null) queryMaxPrice = queryMaxPrice / TASA_CAMBIO_BOB
      }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    }

    if (queryMinPrice != null) {
      where.precio = { ...((where.precio as object) ?? {}), gte: queryMinPrice }
    }
    if (queryMaxPrice != null) {
      where.precio = { ...((where.precio as object) ?? {}), lte: queryMaxPrice }
    }

    // ── ORDER BY ───────────────────────────────────────────────────────────
<<<<<<< HEAD
    const orderBy: any[] = [];
=======
    const orderBy: any[] = []
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

    if (filtros.precio === 'menor-a-mayor') {
      orderBy.push({ precio: 'asc' })
      orderBy.push({ id: 'asc' })
    } else if (filtros.precio === 'mayor-a-menor') {
      orderBy.push({ precio: 'desc' })
    } else if (filtros.superficie === 'menor-a-mayor') {
      orderBy.push({ superficieM2: 'asc' })
    } else if (filtros.superficie === 'mayor-a-menor') {
      orderBy.push({ superficieM2: 'desc' })
    } else if (filtros.fecha === 'mas-recientes') {
      orderBy.push({ fechaPublicacion: 'desc' })
    } else if (filtros.fecha === 'mas-antiguos') {
      orderBy.push({ fechaPublicacion: 'asc' })
    }

    orderBy.push({ id: 'asc' }) // Desempate default

    // ── EJECUCIÓN PRISMA ───────────────────────────────────────────────────
    return prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
<<<<<<< HEAD
            ubicacion_maestra: true,
          },
        },
        publicaciones: {
          where: { estado: "ACTIVA" },
          include: { multimedia: true },
        },
      },
    });
  },
};
=======
            ubicacion_maestra: true
          }
        },
        publicaciones: {
          where: { estado: 'ACTIVA' },
          include: { multimedia: true }
        }
      }
    })
  }
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
