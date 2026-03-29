import { generateToken, type JwtPayload } from "../../utils/jwt.js";
import {
  createSession,
  createUser,
  desactiveSessionByToken,
  findActiveSessionByToken,
  findUser,
  findUserByCorreo,
} from "./auth.repository.js";

type LoginDTO = {
  correo: string;
  password: string;
};

type RegisterDTO = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
};

export const loginService = async (payload: LoginDTO) => {
  const { correo, password } = payload;

  if (!correo || !password) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const user = await findUser(correo);

  if (!user) {
    throw new Error("User not found");
  }

  const isValidPassword = user.password === password.trim();

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    correo: user.correo,
  };

  const token = generateToken(jwtPayload);

  const fechaExpiracion = new Date(Date.now() + 60 * 60 * 1000);

  await createSession({
    token,
    usuarioId: user.id,
    fechaExpiracion,
  });

  return {
    user: {
      id: user.id,
      correo: user.correo,
    },
    token,
  };
};

export const registerUser = async (payload: RegisterDTO) => {
  const { nombre, apellido, correo, password, confirmPassword, telefono } =
    payload;

  if (!nombre || !apellido || !correo || !password || !confirmPassword) {
    throw new Error("Todos los campos obligatorios deben ser completados");
  }

  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  const existingUser = await findUserByCorreo(correo);

  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  const newUser = await createUser({
    nombre,
    apellido,
    correo,
    password,
    rolId: 2,
    telefono,
  });

  return {
    id: newUser.id,
    nombre: newUser.nombre,
    apellido: newUser.apellido,
    correo: newUser.correo,
    telefonos: newUser.telefonos,
  };
};

export const getMeService = async (token: string) => {
  const session = await findActiveSessionByToken(token);

  if (!session) {
    throw new Error("Sesión inválida o expirada");
  }

  return {
    user: {
      id: session.usuario.id,
      nombre: session.usuario.nombre,
      apellido: session.usuario.apellido,
      correo: session.usuario.correo,
      rol: session.usuario.rol,
    },
  };
};

export const logoutService = async (token: string) => {
  const session = await findActiveSessionByToken(token);

  if (!session) {
    throw new Error("Sesión inválida o expirada");
  }

  await desactiveSessionByToken(token);

  return {
    message: "Logout exitoso",
  };
};
