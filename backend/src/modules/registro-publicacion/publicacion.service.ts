import { prisma } from "../../lib/prisma.client.js";
import { validarPermisoPublicacion } from "../publicacion/publicacion.repository.js";

interface PropertyData {
  titulo: string;
  tipoAccion: "VENTA" | "ALQUILER" | "ANTICRETO";
  categoria: "CASA" | "DEPARTAMENTO" | "TERRENO" | "OFICINA";
  precio: number;
  superficieM2?: number;
  nroCuartos?: number;
  nroBanos?: number;
  descripcion: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
}

const createProperty = async (data: PropertyData, userId: number) => {
  // Validar permiso de publicación (gratuitas o premium)
  await validarPermisoPublicacion(userId);

  const result = await prisma.$transaction(async (tx) => {
    const inmueble = await tx.inmueble.create({
      data: {
        titulo: data.titulo,
        tipoAccion: data.tipoAccion,
        categoria: data.categoria,
        precio: data.precio,
        superficieM2: data.superficieM2,
        nroCuartos: data.nroCuartos,
        nroBanos: data.nroBanos,
        descripcion: data.descripcion,
        propietarioId: userId,
      },
    });

    const publicacion = await tx.publicacion.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        usuarioId: userId,
        inmuebleId: inmueble.id,
      },
    });

    await tx.$executeRaw`
      INSERT INTO ubicacion_inmueble ("inmuebleId", "direccion", "latitud", "longitud")
      VALUES (
        ${inmueble.id},
        ${data.direccion},
        ${data.latitud ?? 0},
        ${data.longitud ?? 0}
      )
    `;

    return { inmueble, publicacion };
  });

  return result;
};

export default { createProperty };
