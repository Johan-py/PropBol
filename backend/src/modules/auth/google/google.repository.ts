import {
  createSession,
  createUser,
  findUserByCorreo,
} from "../auth.repository.js";

type CreateGoogleUserInput = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
};

export const findUserByGoogleEmail = async (correo: string) => {
  return await findUserByCorreo(correo);
};

export const createGoogleUser = async (data: CreateGoogleUserInput) => {
  return await createUser({
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    password: data.password,
  });
};

export const createGoogleSession = async ({
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
