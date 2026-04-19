import {
  deactivateUserAccountRepository,
  findUserPasswordByIdRepository,
} from "./security.repository.js";

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
const MAX_PASSWORD_LENGTH = 255;

const attemptsStore = new Map<number, AttemptState>();

const getAttemptState = (userId: number): AttemptState => {
  const existingState = attemptsStore.get(userId);

  if (existingState) {
    return existingState;
  }

  const newState: AttemptState = {
    failedAttempts: 0,
    blockedUntil: null,
  };

  attemptsStore.set(userId, newState);
  return newState;
};

const getBlockStatus = (userId: number) => {
  const state = getAttemptState(userId);

  if (!state.blockedUntil) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const remainingMs = state.blockedUntil - Date.now();

  if (remainingMs <= 0) {
    attemptsStore.delete(userId);
    return { blocked: false, retryAfterSeconds: 0 };
  }

  return { blocked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
};

const registerFailedAttempt = (userId: number) => {
  const state = getAttemptState(userId);

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.blockedUntil = Date.now() + BLOCK_TIME_MS;
    attemptsStore.set(userId, state);

    return {
      blocked: true,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil(BLOCK_TIME_MS / 1000),
    };
  }

  attemptsStore.set(userId, state);

  return {
    blocked: false,
    attemptsLeft: MAX_FAILED_ATTEMPTS - state.failedAttempts,
    retryAfterSeconds: 0,
  };
};

const clearAttemptState = (userId: number) => {
  attemptsStore.delete(userId);
};

export const validateCurrentPasswordService = async (
  userId: number,
  password: string,
) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new SecurityError("Usuario no autorizado.", 401);
  }

  const blockStatus = getBlockStatus(userId);

  if (blockStatus.blocked) {
    const remainingMinutes = Math.ceil(blockStatus.retryAfterSeconds / 60);
    throw new SecurityError(
      `La cuenta sigue bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
      429,
    );
  }

  const rawPassword = typeof password === "string" ? password : "";
  const trimmedPassword = rawPassword.trim();

  if (!trimmedPassword) {
    throw new SecurityError(
      "La contraseña es obligatoria y no puede contener solo espacios en blanco.",
      400,
    );
  }

  if (rawPassword.length > MAX_PASSWORD_LENGTH) {
    throw new SecurityError(
      `La contraseña no puede superar ${MAX_PASSWORD_LENGTH} caracteres.`,
      400,
    );
  }

  const user = await findUserPasswordByIdRepository(userId);

  if (!user) {
    throw new SecurityError("Usuario no encontrado.", 404);
  }

  if (!user.password) {
    throw new SecurityError("El usuario no tiene contraseña registrada.", 400);
  }

  const isValidPassword = user.password === trimmedPassword;

  if (!isValidPassword) {
    const attemptStatus = registerFailedAttempt(userId);

    if (attemptStatus.blocked) {
      const blockMinutes = Math.ceil(BLOCK_TIME_MS / 60000);
      throw new SecurityError(
        `Has superado el número permitido de intentos. La cuenta fue bloqueada temporalmente por ${blockMinutes} minuto(s).`,
        429,
      );
    }

    throw new SecurityError(
      `Contraseña incorrecta. Te quedan ${attemptStatus.attemptsLeft} intento(s) antes del bloqueo temporal.`,
      400,
    );
  }

  clearAttemptState(userId);

  return { valid: true, message: "Contraseña válida." };
};

export const deactivateAccountService = async (
  userId: number,
  password: string,
) => {
  await validateCurrentPasswordService(userId, password);
  await deactivateUserAccountRepository(userId);

  return { message: "Tu cuenta ha sido desactivada correctamente." };
};
