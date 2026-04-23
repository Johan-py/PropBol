import {
  archiveNotificationRepository,
  countNotificationsByUserRepository,
  countUnreadNotificationsRepository,
  createNotificationRepository,
  findNotificationByIdRepository,
  findNotificationsByUserRepository,
  markAllNotificationsAsReadRepository,
  markNotificationAsReadRepository,
<<<<<<< HEAD
  softDeleteNotificationRepository,
} from "../notificaciones/notificaciones.repository.js";
import { findUserByCorreo } from "../auth/auth.repository.js";
import { sendNotificationEmail } from "../email/notification-email.service.js";
import { emitNotificationEvent } from "./notificaciones.events.js";

type NotificationFilter = "todas" | "leida" | "no leida" | "archivada";
=======
  softDeleteNotificationRepository
} from '../notificaciones/notificaciones.repository.js'
import { findUserByCorreo } from '../auth/auth.repository.js'
import { sendNotificationEmail } from '../email/notification-email.service.js'
import { emitNotificationEvent } from './notificaciones.events.js'

type NotificationFilter = 'todas' | 'leida' | 'no leida' | 'archivada'
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

type GetNotificationsParams = {
  filter?: string
  limit?: number
  offset?: number
}

type GetNotificationByIdParams = {
  id: number
  usuarioId: number
}

type CreateNotificationParams = {
<<<<<<< HEAD
  correo: string;
  titulo: string;
  mensaje: string;
};
=======
  correo: string
  titulo: string
  mensaje: string
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const DEFAULT_OFFSET = 0

export class ServiceError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'ServiceError'
    this.statusCode = statusCode
  }
}

const normalizeFilter = (filter?: string): NotificationFilter => {
  if (filter === 'leida') return 'leida'
  if (filter === 'no leida') return 'no leida'
  if (filter === 'archivada') return 'archivada'
  return 'todas'
}

const normalizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit) || !limit || limit < 1) {
    return DEFAULT_LIMIT
  }
<<<<<<< HEAD
  return Math.min(limit, MAX_LIMIT);
};
=======
  return Math.min(limit, MAX_LIMIT)
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

const normalizeOffset = (offset?: number) => {
  if (!Number.isFinite(offset) || offset === undefined || offset < 0) {
    return DEFAULT_OFFSET
  }
<<<<<<< HEAD
  return offset;
};
=======
  return offset
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

const validateNotificationId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError('El id de la notificación no es válido', 400)
  }
<<<<<<< HEAD
};
=======
}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

const mapNotificationToFrontend = (notification: {
  id: number
  titulo: string
  mensaje: string
  leida: boolean | null
  archivada?: boolean | null
  fechaCreacion?: Date | null
}) => {
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.leida === true ? 'leida' : 'no leida',
    archivada: notification.archivada === true ? true : false,
    fechaCreacion: notification.fechaCreacion || null
  }
}

export const getNotificationsService = async (
  usuarioId: number,
  params: GetNotificationsParams
) => {
<<<<<<< HEAD
  const filter = normalizeFilter(params.filter);
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);
=======
  const filter = normalizeFilter(params.filter)
  const limit = normalizeLimit(params.limit)
  const offset = normalizeOffset(params.offset)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  const [notifications, total] = await Promise.all([
    findNotificationsByUserRepository({
      usuarioId,
      filter,
      limit,
      offset
    }),
    countNotificationsByUserRepository({
      usuarioId,
<<<<<<< HEAD
      filter,
    }),
  ]);
=======
      filter
    })
  ])
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  return {
    items: notifications.map(mapNotificationToFrontend),
    total,
    limit,
    offset
  }
}

<<<<<<< HEAD
export const getUnreadCountService = async (usuarioId: number) => {
  const unreadCount = await countUnreadNotificationsRepository(usuarioId);
=======
export const getNotificationByIdService = async ({ id, usuarioId }: GetNotificationByIdParams) => {
  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) return null

>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.leida ? 'leida' : 'no leida',
    archivada: notification.archivada,
    fechaCreacion: notification.fechaCreacion
  }
}

export const getUnreadCountService = async (usuarioId: number) => {
  const unreadCount = await countUnreadNotificationsRepository(usuarioId)
  return {
    unreadCount
  }
}

export const createNotificationService = async ({
  correo,
  titulo,
  mensaje
}: CreateNotificationParams) => {
<<<<<<< HEAD
  const normalizedCorreo = correo.trim().toLowerCase();
  const normalizedTitle = titulo.trim();
  const normalizedMessage = mensaje.trim();
=======
  const normalizedCorreo = correo.trim().toLowerCase()
  const normalizedTitle = titulo.trim()
  const normalizedMessage = mensaje.trim()

  if (!normalizedCorreo) {
    throw new ServiceError('El correo del destinatario es obligatorio', 400)
  }
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  if (!normalizedCorreo) {
    throw new ServiceError("El correo del destinatario es obligatorio", 400);
  }

  if (!normalizedTitle) {
    throw new ServiceError('El título de la notificación es obligatorio', 400)
  }

  if (!normalizedMessage) {
    throw new ServiceError('El mensaje de la notificación es obligatorio', 400)
  }

  const user = await findUserByCorreo(normalizedCorreo)

  if (!user) {
    throw new ServiceError('No existe un usuario con ese correo', 404)
  }

  const user = await findUserByCorreo(normalizedCorreo);

  if (!user) {
    throw new ServiceError("No existe un usuario con ese correo", 404);
  }

  const notification = await createNotificationRepository({
    usuarioId: user.id,
    titulo: normalizedTitle,
    mensaje: normalizedMessage
  })

  emitNotificationEvent(user.id, 'created', notification.id)

<<<<<<< HEAD
  emitNotificationEvent(user.id, "created", notification.id);

  try {
    if (user.correo) {
      await sendNotificationEmail({
        emailDestino: user.correo,
        asunto: notification.titulo,
        mensajeHtml: `<p>${notification.mensaje}</p>`,
        mensajeTexto: notification.mensaje,
      });
=======
  try {
    if (user.correo && user.notificacion_email === true) {
        await sendNotificationEmail({
          emailDestino: user.correo,
          asunto: notification.titulo,
          mensajeHtml: `<p>${notification.mensaje}</p>`,
          mensajeTexto: notification.mensaje
      })
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    }
  } catch (error) {
    console.error('Error enviando correo de notificación:', error)
  }

  return {
    message: 'Notificación creada correctamente',
    item: mapNotificationToFrontend(notification)
  }
}

export const markNotificationAsReadService = async (id: number, usuarioId: number) => {
  validateNotificationId(id)

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) {
    throw new ServiceError('Notificación no encontrada', 404)
  }

  if (!notification.leida) {
    await markNotificationAsReadRepository({
      id,
      usuarioId,
<<<<<<< HEAD
      fechaLectura: new Date(),
    });

    emitNotificationEvent(usuarioId, "read", id);
=======
      fechaLectura: new Date()
    })

    emitNotificationEvent(usuarioId, 'read', id)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  }

  return {
    message: 'Notificación marcada como leída',
    item: {
      id: notification.id,
      title: notification.titulo,
      description: notification.mensaje,
      status: 'leida',
      archivada: notification.archivada === true ? true : false
    }
  }
}

export const markAllNotificationsAsReadService = async (usuarioId: number) => {
  const result = await markAllNotificationsAsReadRepository({
    usuarioId,
    fechaLectura: new Date()
  })

  if (result.count > 0) {
    emitNotificationEvent(usuarioId, 'read-all')
  }

  if (result.count > 0) {
    emitNotificationEvent(usuarioId, "read-all");
  }

  return {
    message: 'Notificaciones marcadas como leídas',
    updatedCount: result.count
  }
}

export const deleteNotificationService = async (id: number, usuarioId: number) => {
  validateNotificationId(id)

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) {
    throw new ServiceError('Notificación no encontrada', 404)
  }

  await softDeleteNotificationRepository({
    id,
    usuarioId
  })

  emitNotificationEvent(usuarioId, 'deleted', id)

  emitNotificationEvent(usuarioId, "deleted", id);

  return {
<<<<<<< HEAD
    message: "Notificación eliminada correctamente",
  };
};

export const archiveNotificationService = async (
  id: number,
  usuarioId: number,
) => {
  validateNotificationId(id);

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId,
  });

  if (!notification) {
    throw new ServiceError("Notificación no encontrada", 404);
=======
    message: 'Notificación eliminada correctamente'
  }
}

export const archiveNotificationService = async (id: number, usuarioId: number) => {
  validateNotificationId(id)

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) {
    throw new ServiceError('Notificación no encontrada', 404)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  }

  if (notification.archivada) {
    return {
<<<<<<< HEAD
      message: "La notificación ya estaba archivada",
      item: mapNotificationToFrontend(notification),
    };
  }

  await archiveNotificationRepository({ id, usuarioId });
  emitNotificationEvent(usuarioId, "archived", id);
=======
      message: 'La notificación ya estaba archivada',
      item: mapNotificationToFrontend(notification)
    }
  }

  await archiveNotificationRepository({ id, usuarioId })
  emitNotificationEvent(usuarioId, 'archived', id)
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83

  return {
    message: 'Notificación archivada correctamente',
    item: mapNotificationToFrontend({ ...notification, archivada: true })
  }
}
