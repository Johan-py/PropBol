import { findUserPasswordByIdRepository } from "./security.repository.js";

export class SecurityError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "SecurityError";
    this.statusCode = statusCode;
  }
}

type AttemptState = {
  failedAttempts: number;
  blockedUntil: number | null;
};

const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_TIME_MS = 15 * 60 * 1000;

const attemptsStore = new Map<number, AttemptState>();

const getAttemptState = (userId: number): AttemptState => {
  const currentState = attemptsStore.get(userId);

  if (currentState) {
    return currentState;
  }

  const initialState: AttemptState = {
    failedAttempts: 0,
    blockedUntil: null,
  };

  attemptsStore.set(userId, initialState);
  return initialState;
};

const clearAttemptState = (userId: number) => {
  attemptsStore.delete(userId);
};

const getRemainingMinutes = (blockedUntil: number) => {
  return Math.ceil((blockedUntil - Date.now()) / 60000);
};

export const validateCurrentPasswordService = async (
  userId: number,
  password: string,
) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const state = getAttemptState(userId);
  const now = Date.now();

  if (state.blockedUntil && now < state.blockedUntil) {
    const remainingMinutes = getRemainingMinutes(state.blockedUntil);

    throw new SecurityError(
      `Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta de nuevo en ${remainingMinutes} minuto(s).`,
      429,
    );
  }

  if (state.blockedUntil && now >= state.blockedUntil) {
    clearAttemptState(userId);
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
    const updatedState = getAttemptState(userId);
    updatedState.failedAttempts += 1;

    if (updatedState.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      updatedState.blockedUntil = Date.now() + BLOCK_TIME_MS;
      updatedState.failedAttempts = 0;

      throw new SecurityError(
        "Cuenta bloqueada temporalmente por 15 minutos debido a 3 intentos fallidos.",
        429,
      );
    }

    const remainingAttempts = MAX_FAILED_ATTEMPTS - updatedState.failedAttempts;

    throw new SecurityError(
      `Contraseña incorrecta. Te quedan ${remainingAttempts} intento(s) antes del bloqueo temporal.`,
      400,
    );
  }

  clearAttemptState(userId);

  return {
    valid: true,
    message: "Contraseña válida.",
  };
};
