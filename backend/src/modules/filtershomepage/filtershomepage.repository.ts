import { $Enums } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";

const CIUDAD_A_DEPTO: Record<string, string> = {
  "SANTA CRUZ DE LA SIERRA": "SANTA CRUZ",
  "SANTA CRUZ": "SANTA CRUZ",
  "LA PAZ": "LA PAZ",
  "EL ALTO": "LA PAZ",
  COCHABAMBA: "COCHABAMBA",
  QUILLACOLLO: "COCHABAMBA",
  SACABA: "COCHABAMBA",
  ORURO: "ORURO",
  POTOSI: "POTOSÍ",
  POTOSÍ: "POTOSÍ",
  SUCRE: "SUCRE",
  CHUQUISACA: "SUCRE",
  TARIJA: "TARIJA",
  TRINIDAD: "BENI",
  BENI: "BENI",
  COBIJA: "PANDO",
  PANDO: "PANDO",
};

function resolverDepartamento(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return CIUDAD_A_DEPTO[upper] ?? upper;
}

export class FiltersHomepageRepository {
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
    const ubicaciones = await prisma.ubicacionInmueble.findMany({
      where: {
        inmueble: {
          tipoAccion: tipoAccion,
          estado: $Enums.EstadoInmueble.ACTIVO,
        },
      },
      select: {
        inmuebleId: true,
        ciudad: true,
        ubicacion_maestra: {
          select: {
            departamento: true,
          },
        },
        inmueble: {
          select: {
            id: true,
            titulo: true,
            publicaciones: {
              select: {
                multimedia: {
                  where: {
                    tipo: $Enums.TipoMultimedia.IMAGEN,
                  },
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    const deptMap = new Map<
      string,
      { ids: Set<number>; previews: Array<{ imagen: string; titulo: string }> }
    >();

    for (const u of ubicaciones) {
      const rawDept = u.ubicacion_maestra?.departamento ?? u.ciudad ?? null;
      if (!rawDept || !u.inmuebleId) continue;

      const dept = resolverDepartamento(rawDept);

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { ids: new Set(), previews: [] });
      }

      const entry = deptMap.get(dept)!;
      entry.ids.add(u.inmuebleId);

      const primeraPublicacion = u.inmueble?.publicaciones?.[0];
      const primeraImagen = primeraPublicacion?.multimedia?.[0]?.url;

      if (entry.previews.length < 6 && primeraImagen) {
        entry.previews.push({
          imagen: primeraImagen,
          titulo: u.inmueble.titulo ?? "Sin título",
        });
      }
    }

    const counts = Array.from(deptMap.entries()).map(([dept, data]) => ({
      departamento: dept,
      count: data.ids.size,
      previews: data.previews,
    }));

    return counts.sort((a, b) => b.count - a.count);
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ["categoria"],
      where: {
        estado: $Enums.EstadoInmueble.ACTIVO,
        categoria: { not: null },
      },
      _count: {
        id: true,
      },
    });
  }
}
