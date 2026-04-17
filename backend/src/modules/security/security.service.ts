import { findUserPasswordByIdRepository } from "./security.repository.js";

export class SecurityError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "SecurityError";
    this.statusCode = statusCode;
  }
}

export const validateCurrentPasswordService = async (
  userId: number,
  password: string,
) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const safePassword = typeof password === "string" ? password.trim() : "";

  if (!safePassword) {
    throw new SecurityError("La contraseña es obligatoria.", 400);
  }

  const user = await findUserPasswordByIdRepository(userId);

  if (!user) {
    throw new SecurityError("Usuario no encontrado.", 404);
  }

  if (!user.password) {
    throw new SecurityError("El usuario no tiene contraseña registrada.", 400);
  }

  const isValidPassword = user.password === safePassword;

  if (!isValidPassword) {
    throw new SecurityError("Contraseña incorrecta.", 400);
  }

  return {
    valid: true,
    message: "Contraseña válida.",
  };
};
