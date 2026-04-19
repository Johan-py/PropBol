// backend/src/modules/publicaciones/publicacion.repository.ts
import { prisma } from "../../lib/prisma.client.js";

const ESTADO_PUBLICACION_ELIMINADA = "ELIMINADA" as const;
const ESTADO_INMUEBLE_INACTIVO = "INACTIVO" as const;

/**
 * Buscar todas las publicaciones activas de un usuario
 * - No debe incluir publicaciones eliminadas
 * - Ordenadas por fecha de publicación descendente
 */
export const buscarPublicacionesPorUsuarioRepository = async (
  usuarioId: number,
) => {
  return prisma.publicacion.findMany({
    where: {
      usuarioId,
      estado: {
        not: ESTADO_PUBLICACION_ELIMINADA,
      },
    },
    include: {
      multimedia: true,
      inmueble: {
        include: {
          ubicacion: {
            select: {
              id: true,
              direccion: true,
              latitud: true,
              longitud: true,
              inmuebleId: true,
              ubicacionMaestraId: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaPublicacion: "desc",
    },
  });
};

/**
 * Buscar una publicación por ID
 * - Incluye datos del inmueble asociado
 */
export const buscarPublicacionPorIdRepository = async (id: number) => {
  return prisma.publicacion.findUnique({
    where: { id },
    include: {
      inmueble: true,
      multimedia: true,
    },
  });
};

/**
 * Eliminar lógicamente una publicación
 * - Cambia estado de publicación a ELIMINADA
 * - Cambia estado de inmueble a INACTIVO
 */
export const eliminarLogicamentePublicacionRepository = async (
  publicacionId: number,
  inmuebleId: number,
) => {
  return prisma.$transaction([
    prisma.publicacion.update({
      where: { id: publicacionId },
      data: {
        estado: ESTADO_PUBLICACION_ELIMINADA,
      },
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: ESTADO_INMUEBLE_INACTIVO,
      },
    }),
  ]);
};

/**
 * Obtener la suscripción activa del usuario (no vencida)
 */
export const obtenerSuscripcionActiva = async (usuarioId: number) => {
  return await prisma.suscripciones_activas.findFirst({
    where: {
      id_usuario: usuarioId,
      estado: "ACTIVA",
      fecha_fin: {
        gte: new Date(),
      },
    },
    include: {
      plan_suscripcion: true,
    },
  });
};

/**
 * VALIDACIÓN CENTRAL PARA PERMITIR LA PUBLICACION DEL INMUEBLE
 */
export const validarPermisoPublicacion = async (usuarioId: number) => {
  const suscripcion = await obtenerSuscripcionActiva(usuarioId);

  if (!suscripcion || !suscripcion.plan_suscripcion) {
    throw new Error("No tienes una suscripción activa");
  }

  const limite = suscripcion.plan_suscripcion.nro_publicaciones_plan;

  const totalPublicaciones = await prisma.publicacion.count({
    where: {
      usuario_id: usuarioId,
    },
  });

  if (limite !== null && totalPublicaciones >= limite) {
    throw new Error("Has alcanzado el límite de publicaciones de tu plan");
  }

  return suscripcion;
};
