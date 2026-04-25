import { $Enums } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";

export class FiltersHomepageRepository {
  // backend/src/modules/filtershomepage/filtershomepage.repository.ts

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
        ubicacion_maestra: { select: { departamento: true } },
        inmueble: {
          select: {
            id: true,
            titulo: true,
            // Volvemos a tu estructura original que es la correcta para tu base de datos
            publicaciones: {
              take: 1,
              select: {
                multimedia: {
                  where: { tipo: $Enums.TipoMultimedia.IMAGEN },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const deptMap = new Map<string, { ids: Set<number>; previews: Array<{ imagen: string; titulo: string }> }>();

    for (const u of ubicaciones) {
      const rawDept = u.ubicacion_maestra?.departamento;
      if (!rawDept || !u.inmuebleId) continue;

      const dept = rawDept.trim().toUpperCase();

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { ids: new Set(), previews: [] });
      }

      const entry = deptMap.get(dept)!;
      entry.ids.add(u.inmuebleId);
      
      const inmueble = u.inmueble;

      // Aquí está el truco: Navegamos de forma segura por Inmueble -> Publicaciones -> Multimedia
      const primeraImagen = inmueble?.publicaciones?.[0]?.multimedia?.[0]?.url ?? null;

      if (entry.previews.length < 6 && primeraImagen && inmueble) {
        entry.previews.push({
          imagen: primeraImagen,
          titulo: inmueble.titulo ?? "Sin título",
        });
      }
    }

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      departamento: dept,
      count: data.ids.size,
      previews: data.previews,
    })).sort((a, b) => b.count - a.count);
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