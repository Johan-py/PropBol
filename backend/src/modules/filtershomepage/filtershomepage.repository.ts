import { $Enums } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";

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
        
        const primeraPublicacion = u.inmueble?.publicaciones?.[0];
      const primeraImagen = primeraPublicacion?.multimedia?.[0]?.url;

      if (entry.previews.length < 6 && primeraImagen) {
         entry.previews.push({
        imagen: primeraImagen,
          titulo: u.inmueble.titulo ?? "Sin título",
        });
      }
<<<<<<< HEAD

      deptCounts.get(normalizedDept)!.add(u.inmuebleId);
    }

    const counts = Array.from(deptCounts.entries()).map(([dept, ids]) => ({
      departamento: dept,
      count: ids.size,
=======
    }

    const counts = Array.from(deptMap.entries()).map(([dept, data]) => ({
      departamento: dept,
      count: data.ids.size,
      previews: data.previews,
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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
