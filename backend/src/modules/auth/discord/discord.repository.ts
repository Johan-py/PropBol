import { prisma } from "../../../lib/prisma.client.js";
import {
  createSession,
  createUser,
  findUserByCorreo,
} from "../auth.repository.js";

type CreateDiscordUserInput = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
};

// Busca si ya existe un vínculo con Discord por su ID externo
export const findUserByDiscordId = async (discordId: string) => {
  const social = await prisma.autenticacion_social.findFirst({
    where: {
      proveedor: "discord",
      idExterno: discordId,
      activo: true,
    },
    include: {
      usuario: true,
    },
  });

  return social?.usuario ?? null;
};

// Busca usuario por correo (fallback)
export const findUserByDiscordEmail = async (correo: string) => {
  return await findUserByCorreo(correo);
};

// Crea el usuario y registra el vínculo con Discord
export const createDiscordUser = async (
  data: CreateDiscordUserInput,
  discordId: string,
  correoProveedor: string,
) => {
  const user = await createUser({
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    password: data.password,
  });

  await prisma.autenticacion_social.create({
    data: {
      usuarioId: user.id,
      proveedor: "discord",
      idExterno: discordId,
      correoProveedor,
      activo: true,
    },
  });

  return user;
};

// Vincula Discord a un usuario existente (si se registró con email y luego vincula Discord)
export const linkDiscordToUser = async (
  usuarioId: number,
  discordId: string,
  correoProveedor: string,
) => {
  return await prisma.autenticacion_social.create({
    data: {
      usuarioId,
      proveedor: "discord",
      idExterno: discordId,
      correoProveedor,
      activo: true,
    },
  });
};

export const createDiscordSession = async ({
  token,
  usuarioId,
  fechaExpiracion,
}: {
  token: string;
  usuarioId: number;
  fechaExpiracion: Date;
}) => {
  return await createSession({
    token,
    usuarioId,
    fechaExpiracion,
  });
};
