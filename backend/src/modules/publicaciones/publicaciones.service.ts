import { publicacionesRepository } from "./publicaciones.repository.js";
import { Publicacion } from "@prisma/client";
<<<<<<< HEAD
=======
import { suscripcionesService } from "../suscripciones/suscripciones.service.js";
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

export const publicacionesService = {
  async listarTodas(): Promise<Publicacion[]> {
    return publicacionesRepository.findAll();
  },

  async listarGratis(): Promise<Publicacion[]> {
    return publicacionesRepository.findGratis();
  },

<<<<<<< HEAD
=======
  async listarMisPublicaciones(userId: number) {
    return publicacionesRepository.findByUserId(userId);
  },

  async obtenerEstadisticasPublicaciones(userId: number) {
    const totalPublicaciones = await publicacionesRepository.countByUser(userId);
    const limite = await suscripcionesService.obtenerLimitePublicaciones(userId);
    const tieneSuscripcion = await suscripcionesService.tieneSuscripcionActiva(userId);
    const suscripcion = await suscripcionesService.obtenerSuscripcionActiva(userId);

    return {
      totalPublicaciones,
      limite,
      disponibles: Math.max(0, limite - totalPublicaciones),
      tieneSuscripcion,
      suscripcion: suscripcion
        ? {
          id: suscripcion.id,
          planNombre: suscripcion.plan_suscripcion?.nombre_plan,
          fechaInicio: suscripcion.fecha_inicio,
          fechaFin: suscripcion.fecha_fin,
        }
        : null,
    };
  },

>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  async crear(
    userId: number,
    data: Partial<Publicacion>,
  ): Promise<Publicacion> {
    const count = await publicacionesRepository.countByUser(userId);

    console.log("📊 Publicaciones del usuario:", count);

    if (count >= 2) {
      throw new Error("LIMIT_REACHED");
    }

    return publicacionesRepository.create(
      userId,
      data as Omit<Publicacion, "id" | "usuarioId">,
    );
  },

  async validarFlujo(userId: number): Promise<string> {
    const count = await publicacionesRepository.countByUser(userId);

    console.log("🔍 Validando flujo, publicaciones:", count);

    if (count >= 2) {
      throw new Error("LIMIT_REACHED");
    }

    return "FLOW_ALLOWED";
  },
<<<<<<< HEAD
=======
  // Agregar después de validarFlujo
  async eliminar(publicacionId: number, userId: number): Promise<void> {
    const publicacion = await publicacionesRepository.findById(publicacionId);

    if (!publicacion) {
      throw new Error("PUBLICACION_NOT_FOUND");
    }

    if (publicacion.usuarioId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    await publicacionesRepository.deleteById(publicacionId);
  },

  async cambiarEstado(publicacionId: number, userId: number, activa: boolean): Promise<void> {
    const publicacion = await publicacionesRepository.findById(publicacionId);

    if (!publicacion) {
      throw new Error("PUBLICACION_NOT_FOUND");
    }

    if (publicacion.usuarioId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    await publicacionesRepository.updateEstado(publicacionId, activa);
  },
<<<<<<< HEAD
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
=======

  // 👉 Nueva función HU‑5 v2
  async validarPublicacionHU5(userId: number, data: Partial<Publicacion>) {
    const count = await publicacionesRepository.countByUser(userId);
    if (count >= 2) {
      throw new Error("LIMIT_REACHED");
    }

    // Aquí no validamos campos (eso lo hace el validator),
    // solo devolvemos estado de negocio
    return {
      estado: "Validado",
      mensaje: "Publicación lista para guardar",
    };
  },
>>>>>>> ae8074f43afab57f05b9fb8258dffe280cac5aca
};
