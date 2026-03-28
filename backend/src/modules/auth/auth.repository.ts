import { prisma } from "../../lib/prisma.js";

interface CreateUserInput {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  rolId: number;
  telefono?: string;
}

export const createUser = async (data: CreateUserInput) => {
  const rol = await prisma.rol.findUnique({
    where: { nombre: 'VISITANTE' }
  })

  if (!rol) throw new Error('Rol de usuario no encontrado')
  return await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      rolId: rol.id,
      telefonos: data.telefono
        ? {
            create: {
              codigoPais: "+591",
              numero: data.telefono,
              principal: true,
            },
          }
        : undefined,
    },
    include: {
      telefonos: true,
    },
  });
};

export const findUser = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo },
  });
};
export const findUserByCorreo = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });
};
export const createSesion = async (usuarioId: number, token: string) => {
  return await prisma.sesion.create({
    data: {
      token,
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estado: true,
      usuarioId
    }
  })
}